from __future__ import annotations

import functools
import logging
from typing import Any, Callable

from django.core.cache import cache
from rest_framework.response import Response

logger = logging.getLogger('apps.core')


def log_action(action: str, level: str = 'info') -> Callable:
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
    owner_field: str = 'created_by'

    def get_queryset(self):
        qs = super().get_queryset()  
        return qs.filter(**{self.owner_field: self.request.user})  


class SerializerByActionMixin:
    serializer_classes: dict[str, Any] = {}

    def get_serializer_class(self):
        return self.serializer_classes.get(self.action, self.serializer_class) 
