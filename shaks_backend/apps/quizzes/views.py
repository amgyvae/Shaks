import logging

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import viewsets, generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrTeacher
from apps.core.decorators import SerializerByActionMixin
from apps.quizzes.models import Quiz, QuizAttempt
from apps.quizzes.serializers import (
    QuizReadSerializer, QuizStudentReadSerializer, QuizWriteSerializer,
    QuizAttemptReadSerializer, QuizAttemptWriteSerializer,
)

logger = logging.getLogger('apps.quizzes')


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.select_related('topic__module__subject', 'topic__module__grade').all()
    filterset_fields = ['topic']
    search_fields = ['question']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return QuizWriteSerializer
        if getattr(self.request.user, 'role', None) == 'student':
            return QuizStudentReadSerializer
        return QuizReadSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    @extend_schema(summary='List quizzes', tags=['Quizzes'], responses={200: QuizReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create quiz question', tags=['Quizzes'], request=QuizWriteSerializer, responses={201: QuizReadSerializer, 403: OpenApiResponse(description='Teacher/admin only')})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


class SubmitAnswerView(generics.CreateAPIView):
    serializer_class = QuizAttemptWriteSerializer

    @extend_schema(
        summary='Submit quiz answer',
        description='Submit an answer to a quiz question. Returns whether the answer is correct.',
        tags=['Quizzes'],
        request=QuizAttemptWriteSerializer,
        responses={
            200: QuizAttemptReadSerializer,
            400: OpenApiResponse(description='Validation error'),
            401: OpenApiResponse(description='Not authenticated'),
        },
    )
    def create(self, request: Request, *args, **kwargs) -> Response:
        serializer = QuizAttemptWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = serializer.validated_data['quiz']
        answer: str = serializer.validated_data['answer']
        is_correct: bool = answer.upper() == quiz.correct_answer.upper()
        attempt, _ = QuizAttempt.objects.update_or_create(
            student=request.user,
            quiz=quiz,
            defaults={'answer': answer, 'is_correct': is_correct},
        )
        logger.info('Quiz %d answered by %s — correct: %s', quiz.pk, request.user.identifier, is_correct)
        return Response(QuizAttemptReadSerializer(attempt).data, status=status.HTTP_200_OK)