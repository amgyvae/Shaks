from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def _auth_headers(user) -> dict:
    tokens = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {tokens.access_token}'}


class ActivateAccountTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+77001111111', full_name='Test User',
        )
        self.url = '/api/auth/register/'

    def test_activate_success(self):
        resp = self.client.post(self.url, {'identifier': '+77001111111', 'password': 'pass123'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    def test_activate_wrong_identifier(self):
        resp = self.client.post(self.url, {'identifier': '+79999999999', 'password': 'pass123'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_activate_already_active(self):
        self.user.is_active = True
        self.user.save()
        resp = self.client.post(self.url, {'identifier': '+77001111111', 'password': 'pass123'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+77002222222', full_name='Active User', is_active=True,
        )
        self.user.set_password('correctpass')
        self.user.save()
        self.url = '/api/auth/login/'

    def test_login_success(self):
        resp = self.client.post(self.url, {'identifier': '+77002222222', 'password': 'correctpass'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    def test_login_wrong_password(self):
        resp = self.client.post(self.url, {'identifier': '+77002222222', 'password': 'wrongpass'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_account(self):
        inactive = User.objects.create_user(
            phone_number='+77003333333', full_name='Inactive', is_active=False,
        )
        inactive.set_password('pass')
        inactive.save()
        resp = self.client.post(self.url, {'identifier': '+77003333333', 'password': 'pass'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class MeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+77004444444', full_name='Me User', is_active=True,
        )
        self.url = '/api/auth/me/'

    def test_get_profile_success(self):
        resp = self.client.get(self.url, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['full_name'], 'Me User')

    def test_get_profile_unauthenticated(self):
        resp = self.client.get(self.url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_invalid_phone(self):
        other = User.objects.create_user(phone_number='+77005555555', full_name='Other')
        resp = self.client.patch(self.url, {'phone_number': '+77005555555'}, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LanguagePreferenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+77006666666', full_name='Lang User', is_active=True,
        )
        self.url = '/api/auth/language/'

    def test_set_language_success(self):
        resp = self.client.patch(self.url, {'language': 'ru'}, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.preferred_language, 'ru')

    def test_invalid_language_code(self):
        resp = self.client.patch(self.url, {'language': 'zh'}, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_language_update(self):
        resp = self.client.patch(self.url, {'language': 'kk'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class TimezonePreferenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number='+77007777777', full_name='TZ User', is_active=True,
        )
        self.url = '/api/auth/timezone/'

    def test_set_timezone_success(self):
        resp = self.client.patch(self.url, {'timezone': 'Europe/London'}, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_invalid_timezone(self):
        resp = self.client.patch(self.url, {'timezone': 'Invalid/Zone'}, **_auth_headers(self.user))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_timezone_update(self):
        resp = self.client.patch(self.url, {'timezone': 'Asia/Almaty'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
