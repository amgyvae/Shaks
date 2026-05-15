from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.notifications.models import Notification

User = get_user_model()


def _auth(user):
    t = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {t.access_token}'}


class NotificationListTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+70000001001', full_name='NUser', is_active=True,
        )
        Notification.objects.create(recipient=self.user, title='Test notif', body='body')
        self.url = '/api/notifications/'

    def test_list_notifications_success(self):
        resp = self.client.get(self.url, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data['results']), 1)

    def test_list_unauthenticated(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_own_notifications(self):
        other = User.objects.create_user(phone_number='+70000001002', full_name='Other', is_active=True)
        Notification.objects.create(recipient=other, title='Other notif')
        resp = self.client.get(self.url, **_auth(self.user))
        for n in resp.data['results']:
            self.assertNotEqual(n['title'], 'Other notif')


class NotificationCountTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+70000001003', full_name='CUser', is_active=True,
        )
        Notification.objects.create(recipient=self.user, title='Unread', is_read=False)
        Notification.objects.create(recipient=self.user, title='Read', is_read=True)
        self.url = '/api/notifications/count/'

    def test_count_unread_success(self):
        resp = self.client.get(self.url, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['unread_count'], 1)

    def test_count_unauthenticated(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_count_after_mark_read(self):
        self.client.post('/api/notifications/read/', **_auth(self.user))
        resp = self.client.get(self.url, **_auth(self.user))
        self.assertEqual(resp.data['unread_count'], 0)


class MarkAllReadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+70000001004', full_name='MUser', is_active=True,
        )
        Notification.objects.create(recipient=self.user, title='N1', is_read=False)
        Notification.objects.create(recipient=self.user, title='N2', is_read=False)
        self.url = '/api/notifications/read/'

    def test_mark_all_read_success(self):
        resp = self.client.post(self.url, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Notification.objects.filter(recipient=self.user, is_read=False).count(), 0)

    def test_mark_all_read_unauthenticated(self):
        resp = self.client.post(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_mark_all_read_idempotent(self):
        self.client.post(self.url, **_auth(self.user))
        resp = self.client.post(self.url, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
