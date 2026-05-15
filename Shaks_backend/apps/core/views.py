import asyncio
import logging
from typing import Any

import httpx
from asgiref.sync import sync_to_async
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiResponse
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger('apps.core')

EXCHANGE_RATES_URL = 'https://open.er-api.com/v6/latest/USD'
CURRENT_TIME_URL = 'https://timeapi.io/api/time/current/zone?timeZone=Asia/Almaty'


async def _fetch_exchange_rates(client: httpx.AsyncClient) -> dict[str, float]:
    """Fetch KZT, RUB, EUR rates from open.er-api.com."""
    try:
        resp = await client.get(EXCHANGE_RATES_URL, timeout=10)
        resp.raise_for_status()
        rates = resp.json().get('rates', {})
        return {
            'KZT': rates.get('KZT', 0.0),
            'RUB': rates.get('RUB', 0.0),
            'EUR': rates.get('EUR', 0.0),
        }
    except Exception as exc:
        logger.warning('Exchange rate fetch failed: %s', exc)
        return {'KZT': 0.0, 'RUB': 0.0, 'EUR': 0.0}


async def _fetch_current_time(client: httpx.AsyncClient) -> str:
    try:
        resp = await client.get(CURRENT_TIME_URL, timeout=10)
        resp.raise_for_status()
        return resp.json().get('dateTime', timezone.now().isoformat())
    except Exception as exc:
        logger.warning('Time API fetch failed: %s', exc)
        return timezone.now().isoformat()


@sync_to_async
def _get_platform_stats() -> dict[str, int]:
    from django.contrib.auth import get_user_model
    from apps.courses.models import Topic
    from apps.assignments.models import Submission
    from apps.social.models import Post

    User = get_user_model()
    return {
        'total_users': User.objects.count(),
        'total_topics': Topic.objects.count(),
        'total_submissions': Submission.objects.count(),
        'total_posts': Post.objects.count(),
    }


class StatsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Platform statistics',
        description=(
            'Returns Shaks LMS statistics combined with live exchange rates '
            'and current Almaty time. Both external API calls run concurrently '
            '(asyncio.gather) so total latency ≤ max(exchange_rates_latency, time_latency). '
            'No authentication required.'
        ),
        tags=['Stats'],
        responses={
            200: OpenApiResponse(
                description='Stats payload',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'platform': {
                                'total_users': 120,
                                'total_topics': 340,
                                'total_submissions': 870,
                                'total_posts': 55,
                            },
                            'exchange_rates': {'KZT': 450.23, 'RUB': 89.10, 'EUR': 0.92},
                            'current_time': '2024-03-15T18:30:00+05:00',
                        },
                    )
                ],
            )
        },
    )
    async def get(self, request: Request) -> Response:
        logger.info('Stats endpoint called')
        async with httpx.AsyncClient() as client:
            platform_stats, (rates, current_time) = await asyncio.gather(
                _get_platform_stats(),
                asyncio.gather(
                    _fetch_exchange_rates(client),
                    _fetch_current_time(client),
                ),
            )
        return Response({
            'platform': platform_stats,
            'exchange_rates': rates,
            'current_time': current_time,
        })
