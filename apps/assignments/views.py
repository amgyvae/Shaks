import logging

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrTeacher
from apps.assignments.models import Assignment, AssignmentView, Submission
from apps.assignments.serializers import (
    AssignmentReadSerializer, AssignmentWriteSerializer,
    SubmissionReadSerializer, SubmissionWriteSerializer,
    ReviewSubmissionSerializer, AssignmentStudentRowSerializer,
)
from apps.core.decorators import SerializerByActionMixin

logger = logging.getLogger('apps.assignments')
User = get_user_model()


class AssignmentViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    serializer_class = AssignmentReadSerializer
    serializer_classes = {
        'create': AssignmentWriteSerializer,
        'update': AssignmentWriteSerializer,
        'partial_update': AssignmentWriteSerializer,
    }
    filterset_fields = ['topic', 'created_by']
    search_fields = ['title', 'instructions']
    ordering_fields = ['created_at', 'due_date']

    def get_queryset(self):
        return (
            Assignment.objects
            .select_related('topic__module__grade', 'topic__module__subject', 'created_by')
            .all()
        )

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = (
            Assignment.objects
            .select_related('topic__module__grade', 'topic__module__subject', 'created_by')
        )
        user = self.request.user
        if getattr(user, 'role', None) == 'student':
            if user.grade_id:
                qs = qs.filter(topic__module__grade_id=user.grade_id)
            else:
                qs = qs.none()
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        logger.info('Assignment created by %s', self.request.user.identifier)

    def retrieve(self, request: Request, *args, **kwargs) -> Response:
        instance = self.get_object()
        if getattr(request.user, 'role', None) == 'student':
            AssignmentView.objects.get_or_create(student=request.user, assignment=instance)
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary='List assignments', tags=['Assignments'], responses={200: AssignmentReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create assignment', tags=['Assignments'], request=AssignmentWriteSerializer, responses={201: AssignmentReadSerializer})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Student status for assignment',
        description='Returns per-student view/submission status for an assignment. Permission: IsAdminOrTeacher.',
        tags=['Assignments'],
        responses={200: AssignmentStudentRowSerializer(many=True), 403: OpenApiResponse(description='Teacher/admin only')},
    )
    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrTeacher])
    def students(self, request: Request, pk=None) -> Response:
        assignment = self.get_object()
        grade_id = assignment.topic.module.grade_id if assignment.topic else None
        students = User.objects.filter(role='student')
        if grade_id:
            students = students.filter(grade_id=grade_id)
        viewed_ids = set(AssignmentView.objects.filter(assignment=assignment).values_list('student_id', flat=True))
        submissions = {s.student_id: s for s in Submission.objects.filter(assignment=assignment)}
        rows = []
        for s in students:
            sub = submissions.get(s.id)
            rows.append({
                'student_id': s.id,
                'student_name': s.full_name,
                'viewed': s.id in viewed_ids,
                'submitted': sub is not None,
                'status': sub.status if sub else '',
                'grade': sub.grade if sub else '',
                'feedback': sub.feedback if sub else '',
                'submission_id': sub.id if sub else None,
                'image': request.build_absolute_uri(sub.file.url) if sub and sub.file else None,
                'submitted_at': sub.submitted_at if sub else None,
            })
        return Response(AssignmentStudentRowSerializer(rows, many=True).data)


class SubmissionViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    serializer_class = SubmissionReadSerializer
    serializer_classes = {
        'create': SubmissionWriteSerializer,
    }
    filterset_fields = ['assignment', 'status']
    ordering_fields = ['submitted_at']

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related('student', 'assignment')
        if getattr(user, 'role', None) == 'student':
            return qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
        logger.info('Submission created by %s', self.request.user.identifier)

    @extend_schema(summary='List submissions', tags=['Assignments'], responses={200: SubmissionReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Submit assignment', tags=['Assignments'], request=SubmissionWriteSerializer, responses={201: SubmissionReadSerializer})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class ReviewSubmissionView(generics.UpdateAPIView):
    serializer_class = ReviewSubmissionSerializer
    permission_classes = [IsAdminOrTeacher]
    queryset = Submission.objects.all()

    def perform_update(self, serializer):
        serializer.save(reviewed_at=timezone.now())
        logger.info('Submission %s reviewed by %s', self.kwargs.get('pk'), self.request.user.identifier)

    @extend_schema(
        summary='Review submission',
        description='Teacher/admin reviews a student submission (approve, reject, grade, feedback).',
        tags=['Assignments'],
        request=ReviewSubmissionSerializer,
        responses={200: SubmissionReadSerializer, 403: OpenApiResponse(description='Teacher/admin only')},
    )
    def patch(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
