"""
Settings package init — imports Celery app so it is loaded with Django.
"""
from .celery import app as celery_app  # noqa: F401

__all__ = ['celery_app']
