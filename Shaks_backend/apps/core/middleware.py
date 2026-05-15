import logging
from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import translation, timezone as tz
from django.utils.translation import gettext as _

logger = logging.getLogger('apps.core')

SUPPORTED_LANGUAGES: tuple[str, ...] = ('en', 'ru', 'kk')


class LanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = self._resolve_language(request)
        translation.activate(lang)
        request.LANGUAGE_CODE = lang

        user = getattr(request, 'user', None)
        if user and user.is_authenticated and getattr(user, 'timezone', None):
            try:
                import pytz
                tz.activate(pytz.timezone(user.timezone))
            except Exception:
                tz.deactivate()
        else:
            tz.deactivate()

        response = self.get_response(request)
        translation.deactivate()
        return response

    def _resolve_language(self, request) -> str:
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            user_lang = getattr(user, 'preferred_language', None)
            if user_lang and user_lang in SUPPORTED_LANGUAGES:
                logger.debug('Language from user profile: %s', user_lang)
                return user_lang

        lang_param = request.GET.get('lang', '').strip().lower()
        if lang_param and lang_param in SUPPORTED_LANGUAGES:
            logger.debug('Language from query param: %s', lang_param)
            return lang_param

        accept = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
        for part in accept.split(','):
            code = part.split(';')[0].strip().lower()[:2]
            if code in SUPPORTED_LANGUAGES:
                logger.debug('Language from Accept-Language: %s', code)
                return code

        return 'en'



@database_sync_to_async
def _get_user_from_token(token_key: str):
    """Decode JWT and return the corresponding User, or AnonymousUser."""
    from rest_framework_simplejwt.tokens import AccessToken
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        token = AccessToken(token_key)
        return User.objects.get(id=token['user_id'])
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token_list = params.get('token', [])
        scope['user'] = (
            await _get_user_from_token(token_list[0]) if token_list else AnonymousUser()
        )
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    from channels.auth import AuthMiddlewareStack
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))
