import logging

from rest_framework.views import exception_handler
from rest_framework.response import Response

logger = logging.getLogger('apps.core')


def custom_exception_handler(exc, context) -> Response | None:
    logger.exception('Unhandled exception in %s: %s', context.get('view'), exc)
    response = exception_handler(exc, context)
    if response is not None and response.status_code == 429:
        response.data = {'detail': 'Too many requests. Try again later.'}
    return response
