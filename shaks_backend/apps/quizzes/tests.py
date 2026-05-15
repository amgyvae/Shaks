from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.contrib.auth import get_user_model

from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

def make_user(role='student', identifier='user@test.com', **kwargs):
    user = User.objects.create_user(
        username=identifier,
        email=identifier,
        password='testpass123',
        **kwargs,
    )
    user.role = role
    user.save()
    return user

class QuizListPermissionsTest(TestCase):
    """GET /api/quizzes/ — должен отдавать 200 авторизованным и 401 анонимным."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/quizzes/' 
        self.student = make_user(role='student', identifier='student@test.com')

    def test_anonymous_user_gets_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_student_gets_200(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class QuizCreatePermissionsTest(TestCase):
    """POST /api/quizzes/ — 403 для студентов, 201 для учителей."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/quizzes/'

        self.student = make_user(role='student', identifier='student2@test.com')
        self.teacher = make_user(role='teacher', identifier='teacher@test.com')

        self.payload = {
            'topic': 1,
            'question': 'Сколько будет 2 + 2?',
            'option_a': '3',
            'option_b': '4',
            'correct_answer': 'B',
        }

    def test_student_cannot_create_quiz(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('apps.quizzes.serializers.QuizWriteSerializer.is_valid', return_value=True)
    @patch('apps.quizzes.serializers.QuizWriteSerializer.save')
    @patch('apps.quizzes.serializers.QuizWriteSerializer.data', new_callable=lambda: property(lambda self: {'id': 1}))
    def test_teacher_can_create_quiz(self, mock_data, mock_save, mock_valid):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(self.url, self.payload, format='json')
        self.assertNotEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class SubmitAnswerTest(TestCase):
    """POST /api/quizzes/submit/ — проверяем флаг is_correct в ответе."""

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/quizzes/submit/' 
        self.student = make_user(role='student', identifier='student3@test.com')
        self.client.force_authenticate(user=self.student)

    @patch('apps.quizzes.views.QuizAttempt.objects.update_or_create')
    @patch('apps.quizzes.views.QuizAttemptWriteSerializer')
    def test_correct_answer_returns_is_correct_true(self, MockSerializer, mock_uoc):
        fake_quiz = MagicMock()
        fake_quiz.pk = 1
        fake_quiz.correct_answer = 'B'

        mock_instance = MockSerializer.return_value
        mock_instance.is_valid.return_value = True
        mock_instance.validated_data = {'quiz': fake_quiz, 'answer': 'B'}

        fake_attempt = MagicMock()
        fake_attempt.is_correct = True
        mock_uoc.return_value = (fake_attempt, True)

        response = self.client.post(self.url, {'quiz': 1, 'answer': 'B'}, format='json')

        _, kwargs = mock_uoc.call_args
        self.assertTrue(kwargs['defaults']['is_correct'])

    @patch('apps.quizzes.views.QuizAttempt.objects.update_or_create')
    @patch('apps.quizzes.views.QuizAttemptWriteSerializer')
    def test_wrong_answer_returns_is_correct_false(self, MockSerializer, mock_uoc):
        fake_quiz = MagicMock()
        fake_quiz.pk = 1
        fake_quiz.correct_answer = 'B'

        mock_instance = MockSerializer.return_value
        mock_instance.is_valid.return_value = True
        mock_instance.validated_data = {'quiz': fake_quiz, 'answer': 'A'}

        fake_attempt = MagicMock()
        fake_attempt.is_correct = False
        mock_uoc.return_value = (fake_attempt, True)

        response = self.client.post(self.url, {'quiz': 1, 'answer': 'A'}, format='json')

        _, kwargs = mock_uoc.call_args
        self.assertFalse(kwargs['defaults']['is_correct'])

    @patch('apps.quizzes.views.QuizAttempt.objects.update_or_create')
    @patch('apps.quizzes.views.QuizAttemptWriteSerializer')
    def test_answer_comparison_is_case_insensitive(self, MockSerializer, mock_uoc):
        fake_quiz = MagicMock()
        fake_quiz.pk = 1
        fake_quiz.correct_answer = 'B'

        mock_instance = MockSerializer.return_value
        mock_instance.is_valid.return_value = True
        mock_instance.validated_data = {'quiz': fake_quiz, 'answer': 'b'}

        fake_attempt = MagicMock()
        mock_uoc.return_value = (fake_attempt, True)

        self.client.post(self.url, {'quiz': 1, 'answer': 'b'}, format='json')

        _, kwargs = mock_uoc.call_args
        self.assertTrue(kwargs['defaults']['is_correct'])