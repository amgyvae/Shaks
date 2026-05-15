from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.courses.models import Grade, Subject, Module, Topic

User = get_user_model()


def _auth(user):
    t = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {t.access_token}'}


class GradeTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            phone_number='+70000000001', full_name='Admin', role='admin', is_active=True,
        )
        self.admin.set_password('pass'); self.admin.save()
        self.student = User.objects.create_user(
            phone_number='+70000000002', full_name='Student', role='student', is_active=True,
        )
        self.url = '/api/courses/grades/'

    def test_list_grades_authenticated(self):
        Grade.objects.create(name='Grade 5')
        resp = self.client.get(self.url, **_auth(self.student))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_grades_unauthenticated(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_grade_as_student_forbidden(self):
        resp = self.client.post(self.url, {'name': 'Grade X'}, **_auth(self.student))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class TopicTests(APITestCase):
    def setUp(self):
        self.teacher = User.objects.create_user(
            phone_number='+70000000003', full_name='Teacher', role='teacher', is_active=True,
        )
        self.student = User.objects.create_user(
            phone_number='+70000000004', full_name='Student', role='student', is_active=True,
        )
        grade = Grade.objects.create(name='Grade 1')
        subject = Subject.objects.create(name='Maths', created_by=self.teacher)
        self.module = Module.objects.create(title='Module 1', subject=subject, grade=grade, order=1)
        self.url = '/api/courses/topics/'

    def test_list_topics_success(self):
        Topic.objects.create(title='Topic 1', module=self.module, order=1)
        resp = self.client.get(self.url, **_auth(self.student))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_topic_as_teacher_success(self):
        resp = self.client.post(self.url, {'title': 'New Topic', 'module': self.module.pk, 'order': 2}, **_auth(self.teacher))
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_topic_as_student_forbidden(self):
        resp = self.client.post(self.url, {'title': 'Hack', 'module': self.module.pk}, **_auth(self.student))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
