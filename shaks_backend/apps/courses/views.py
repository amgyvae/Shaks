import logging

from django.db.models import Count
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAdminOrTeacher
from apps.core.decorators import SerializerByActionMixin, cache_response
from apps.courses.models import Grade, Subject, Module, Topic, Announcement, VideoWatch
from apps.courses.serializers import (
    GradeReadSerializer, GradeWriteSerializer,
    SubjectReadSerializer, SubjectWriteSerializer,
    ModuleReadSerializer, ModuleListReadSerializer, ModuleWriteSerializer,
    TopicReadSerializer, TopicWriteSerializer,
    AnnouncementReadSerializer, AnnouncementWriteSerializer,
)

logger = logging.getLogger('apps.courses')


class GradeViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeReadSerializer
    serializer_classes = {
        'create': GradeWriteSerializer,
        'update': GradeWriteSerializer,
        'partial_update': GradeWriteSerializer,
    }
    filterset_fields = ['name']
    search_fields = ['name']
    ordering_fields = ['name']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    @extend_schema(summary='List grades', tags=['Courses'], responses={200: GradeReadSerializer(many=True), 401: OpenApiResponse(description='Authentication credentials not provided.')})
    @cache_response('grade_list', timeout=120)
    def list(self, request, *args, **kwargs):
        logger.debug('Grade list requested')
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create grade', tags=['Courses'], request=GradeWriteSerializer, responses={201: GradeReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.'), 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class SubjectViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    queryset = Subject.objects.select_related('created_by').all()
    serializer_class = SubjectReadSerializer
    serializer_classes = {
        'create': SubjectWriteSerializer,
        'update': SubjectWriteSerializer,
        'partial_update': SubjectWriteSerializer,
    }
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        logger.info('Subject created by %s', self.request.user.identifier)

    @extend_schema(summary='List subjects', tags=['Courses'], responses={200: SubjectReadSerializer(many=True), 401: OpenApiResponse(description='Authentication credentials not provided.')})
    @cache_response('subject_list', timeout=120)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create subject', tags=['Courses'], request=SubjectWriteSerializer, responses={201: SubjectReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.'), 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ModuleViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    serializer_class = ModuleListReadSerializer
    serializer_classes = {
        'retrieve': ModuleReadSerializer,
        'create': ModuleWriteSerializer,
        'update': ModuleWriteSerializer,
        'partial_update': ModuleWriteSerializer,
    }
    filterset_fields = ['subject', 'grade']
    search_fields = ['title']
    ordering_fields = ['order', 'title']

    def get_queryset(self):
        return (
            Module.objects
            .select_related('subject', 'grade')
            .prefetch_related('topics')
            .annotate(topic_count=Count('topics'))
        )

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    @extend_schema(
        summary='List modules',
        tags=['Courses'],
        parameters=[
            OpenApiParameter('subject', description='Filter by subject ID', required=False, type=int),
            OpenApiParameter('grade', description='Filter by grade ID', required=False, type=int),
        ],
        responses={200: ModuleListReadSerializer(many=True), 401: OpenApiResponse(description='Authentication credentials not provided.')},
    )
    @cache_response('module_list', timeout=120)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Get module with topics', tags=['Courses'], responses={200: ModuleReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.')})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary='Create module', tags=['Courses'], request=ModuleWriteSerializer, responses={201: ModuleReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.'), 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class TopicViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    serializer_class = TopicReadSerializer
    serializer_classes = {
        'create': TopicWriteSerializer,
        'update': TopicWriteSerializer,
        'partial_update': TopicWriteSerializer,
    }
    filterset_fields = ['module']
    search_fields = ['title']
    ordering_fields = ['order', 'title']

    def get_queryset(self):
        return (
            Topic.objects
            .select_related('module__subject', 'module__grade')
            .annotate(watch_count=Count('watches'))
        )

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    @extend_schema(summary='List topics', tags=['Courses'], responses={200: TopicReadSerializer(many=True), 401: OpenApiResponse(description='Authentication credentials not provided.')})
    @cache_response('topic_list', timeout=120)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create topic', tags=['Courses'], request=TopicWriteSerializer, responses={201: TopicReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.'), 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class AnnouncementViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related('author').all()
    serializer_class = AnnouncementReadSerializer
    serializer_classes = {
        'create': AnnouncementWriteSerializer,
        'update': AnnouncementWriteSerializer,
        'partial_update': AnnouncementWriteSerializer,
    }
    search_fields = ['title', 'body']
    ordering_fields = ['created_at']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @extend_schema(summary='List announcements', tags=['Courses'], responses={200: AnnouncementReadSerializer(many=True), 401: OpenApiResponse(description='Authentication credentials not provided.')})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create announcement', tags=['Courses'], request=AnnouncementWriteSerializer, responses={201: AnnouncementReadSerializer, 401: OpenApiResponse(description='Authentication credentials not provided.'), 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class MarkVideoWatchedView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TopicReadSerializer

    @extend_schema(
        summary='Mark topic as watched',
        description='Record that the authenticated student has watched a topic video.',
        tags=['Courses'],
        responses={200: OpenApiResponse(description='{"watched": true}'), 401: OpenApiResponse(description='Authentication credentials not provided.'), 404: OpenApiResponse(description='Topic not found')},
    )
    def post(self, request: Request, pk: int) -> Response:
        try:
            topic = Topic.objects.get(pk=pk)
        except Topic.DoesNotExist:
            return Response({'detail': _('Topic not found.')}, status=status.HTTP_404_NOT_FOUND)
        VideoWatch.objects.get_or_create(student=request.user, topic=topic)
        logger.info('User %s watched topic %d', request.user.identifier, pk)
        return Response({'watched': True})


class WatchedTopicsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary='Get watched topic IDs',
        description='Returns a list of topic IDs the authenticated student has watched.',
        tags=['Courses'],
        responses={200: OpenApiResponse(description='{"watched_topic_ids": [1, 2, 3]}'), 401: OpenApiResponse(description='Authentication credentials not provided.')},
    )
    def get(self, request: Request) -> Response:
        ids = VideoWatch.objects.filter(student=request.user).values_list('topic_id', flat=True)
        return Response({'watched_topic_ids': list(ids)})