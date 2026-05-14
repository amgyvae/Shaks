"""
Reusable decorators and mixins to reduce code duplication across the project.
"""
from __future__ import annotations

import functools
import logging
from typing import Any, Callable

from django.core.cache import cache
from rest_framework.response import Response

logger = logging.getLogger('apps.core')


def log_action(action: str, level: str = 'info') -> Callable:
    """
    Decorator that logs the entry and exit of a view method.

    Usage::

        @log_action('user registration')
        def create(self, request, *args, **kwargs):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            log = getattr(logger, level, logger.info)
            log('Starting: %s', action)
            try:
                result = func(*args, **kwargs)
                log('Completed: %s', action)
                return result
            except Exception as exc:
                logger.exception('Failed: %s — %s', action, exc)
                raise
        return wrapper
    return decorator


def cache_response(key_prefix: str, timeout: int = 60) -> Callable:
    """
    Decorator that caches a view's Response data in Redis.

    The cache key includes the prefix and the full request path + query string
    so language-specific and filter-specific responses are cached independently.

    Usage::

        @cache_response('course_list', timeout=120)
        def list(self, request, *args, **kwargs):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(self, request, *args, **kwargs) -> Any:
            lang = getattr(request, 'LANGUAGE_CODE', 'en')
            key = f'{key_prefix}:{lang}:{request.get_full_path()}'
            cached = cache.get(key)
            if cached is not None:
                logger.debug('Cache HIT for key: %s', key)
                return Response(cached)
            response = func(self, request, *args, **kwargs)
            if hasattr(response, 'data'):
                cache.set(key, response.data, timeout)
                logger.debug('Cache SET for key: %s (ttl=%ds)', key, timeout)
            return response
        return wrapper
    return decorator


class OwnerQuerysetMixin:
    """
    Mixin that restricts queryset to objects owned by the current user.
    Requires the model to have an `owner_field` attribute on the viewset.
    """

    owner_field: str = 'created_by'

    def get_queryset(self):
        qs = super().get_queryset()  # type: ignore[misc]
        return qs.filter(**{self.owner_field: self.request.user})  # type: ignore[attr-defined]


class SerializerByActionMixin:
    """
    Mixin that selects different serializer classes for different actions.

    Subclasses define::

        serializer_classes = {
            'list': MyListSerializer,
            'retrieve': MyDetailSerializer,
            'create': MyWriteSerializer,
            'update': MyWriteSerializer,
            'partial_update': MyWriteSerializer,
        }
        serializer_class = MyListSerializer  # fallback
    """

    serializer_classes: dict[str, Any] = {}

    def get_serializer_class(self):
        return self.serializer_classes.get(self.action, self.serializer_class)  # type: ignore[attr-defined]
