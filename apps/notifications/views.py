import logging

from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationReadSerializer

logger = logging.getLogger('apps.notifications')


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_read']
    ordering_fields = ['created_at']
    queryset = Notification.objects.none() 

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Notification.objects.none()
        return (
            Notification.objects
            .filter(recipient=self.request.user)
            .select_related('recipient')
        )

    @extend_schema(
        summary='List notifications',
        description=(
            'Returns paginated notifications for the authenticated user. '
            'Filter with ?is_read=true|false. '
            'Permission: IsAuthenticated.'
        ),
        tags=['Notifications'],
        responses={
            200: NotificationReadSerializer(many=True),
            401: OpenApiResponse(description='Not authenticated'),
        },
    )
    def list(self, request: Request, *args, **kwargs) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Get notification detail',
        tags=['Notifications'],
        responses={200: NotificationReadSerializer, 404: OpenApiResponse(description='Not found')},
    )
    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary='Unread notification count',
        description='Returns the number of unread notifications. Permission: IsAuthenticated.',
        tags=['Notifications'],
        responses={200: OpenApiResponse(description='{"unread_count": <int>}')},
    )
    @action(detail=False, methods=['get'], url_path='count')
    def count(self, request: Request) -> Response:
        unread = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': unread})

    @extend_schema(
        summary='Mark all notifications as read',
        description='Marks all unread notifications as read. Permission: IsAuthenticated.',
        tags=['Notifications'],
        responses={200: OpenApiResponse(description='{"status": "ok"}')},
    )
    @action(detail=False, methods=['post'], url_path='read')
    def mark_all_read(self, request: Request) -> Response:
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        logger.info('Marked %d notifications as read for user %s', updated, request.user.identifier)
        return Response({'status': 'ok', 'updated': updated})

    @extend_schema(
        summary='Mark one notification as read',
        tags=['Notifications'],
        responses={200: OpenApiResponse(description='{"status": "ok"}'), 404: OpenApiResponse(description='Not found')},
    )
    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request: Request, pk=None) -> Response:
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response({'status': 'ok'})
