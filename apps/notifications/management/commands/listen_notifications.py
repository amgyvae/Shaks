"""
Async management command to subscribe to Redis Pub/Sub and print notification events.

Why async?
  Redis Pub/Sub is an I/O-bound operation — the subscriber waits indefinitely
  for messages. Using asyncio + the async Redis client means the event loop
  can handle other coroutines (e.g. health-check pings) while waiting,
  without blocking a thread.

  A synchronous implementation would block a worker thread for its entire
  lifetime, wasting resources and preventing graceful shutdown.

Usage:
  python manage.py listen_notifications
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import signal

from django.core.management.base import BaseCommand

logger = logging.getLogger('apps.notifications')

CHANNEL = 'shaks:notifications'


async def _listen() -> None:
    """Subscribe to the notifications Redis channel and print incoming events."""
    import redis.asyncio as aioredis
    from django.conf import settings

    redis_url: str = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
    client = aioredis.from_url(redis_url, decode_responses=True)
    pubsub = client.pubsub()
    await pubsub.subscribe(CHANNEL)
    logger.info('Subscribed to Redis channel: %s', CHANNEL)
    print(f'[listen_notifications] Subscribed to "{CHANNEL}". Waiting for messages...')

    loop = asyncio.get_event_loop()
    stop_event = asyncio.Event()

    def _handle_signal(*_):
        stop_event.set()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, _handle_signal)

    try:
        async for message in pubsub.listen():
            if stop_event.is_set():
                break
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                except json.JSONDecodeError:
                    data = message['data']
                logger.info('Notification event received: %s', data)
                print(f'[notification] {data}')
    finally:
        await pubsub.unsubscribe(CHANNEL)
        await client.aclose()
        print('[listen_notifications] Unsubscribed and shut down.')


class Command(BaseCommand):
    help = 'Subscribe to Redis Pub/Sub channel and print incoming notification events (async).'

    def handle(self, *args, **options) -> None:
        asyncio.run(_listen())
