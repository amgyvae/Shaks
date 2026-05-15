import logging

from drf_spectacular.utils import extend_schema, OpenApiResponse

from rest_framework import viewsets, permissions

from apps.accounts.permissions import IsAdminOrTeacher
from apps.core.decorators import SerializerByActionMixin
from apps.meetings.models import Meeting
from apps.meetings.serializers import MeetingReadSerializer, MeetingWriteSerializer

logger = logging.getLogger('apps.meetings')


class MeetingViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related('created_by').all()
    serializer_class = MeetingReadSerializer
    serializer_classes = {
        'create': MeetingWriteSerializer,
        'update': MeetingWriteSerializer,
        'partial_update': MeetingWriteSerializer,
    }
    filterset_fields = ['created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['scheduled_at', 'created_at']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        logger.info('Meeting created by %s', self.request.user.identifier)

    @extend_schema(summary='List meetings', tags=['Meetings'], responses={200: MeetingReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create meeting', tags=['Meetings'], request=MeetingWriteSerializer, responses={201: MeetingReadSerializer, 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary='Get meeting detail', tags=['Meetings'], responses={200: MeetingReadSerializer})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary='Update meeting', tags=['Meetings'], request=MeetingWriteSerializer, responses={200: MeetingReadSerializer})
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary='Delete meeting', tags=['Meetings'], responses={204: None})
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
