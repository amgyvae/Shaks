from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.social.models import Post

User = get_user_model()


def _auth(user):
    t = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {t.access_token}'}


class PostListCreateTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone_number='+70000002001', full_name='Poster', is_active=True)
        self.url = '/api/social/posts/'

    def test_create_post_success(self):
        resp = self.client.post(self.url, {'text': 'Hello!'}, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_post_unauthenticated(self):
        resp = self.client.post(self.url, {'text': 'Hello!'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_post_empty_text(self):
        resp = self.client.post(self.url, {'text': ''}, **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class PostLikeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(phone_number='+70000002002', full_name='Liker', is_active=True)
        self.post = Post.objects.create(author=self.user, text='Likeable post')

    def test_like_post_success(self):
        resp = self.client.post(f'/api/social/posts/{self.post.pk}/like/', **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['liked'])

    def test_like_post_unauthenticated(self):
        resp = self.client.post(f'/api/social/posts/{self.post.pk}/like/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_like_nonexistent_post(self):
        resp = self.client.post('/api/social/posts/999999/like/', **_auth(self.user))
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
