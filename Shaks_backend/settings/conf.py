from pathlib import Path

from decouple import AutoConfig, Csv


_ENV_DIR: Path = Path(__file__).resolve().parent
config = AutoConfig(search_path=_ENV_DIR)

#Core
SECRET_KEY: str = config('SHAKS_SECRET_KEY', default='django-insecure-change-me')
DEBUG: bool = config('SHAKS_DEBUG', default=True, cast=bool)
ALLOWED_HOSTS: list[str] = config('SHAKS_ALLOWED_HOSTS', default='*', cast=Csv())

#Database 
DATABASE_URL: str = config('SHAKS_DATABASE_URL', default='')

#Redis 
REDIS_URL: str = config('SHAKS_REDIS_URL', default='redis://localhost:6379/0')
CELERY_BROKER_URL: str = config('SHAKS_CELERY_BROKER_URL', default='redis://localhost:6379/1')
CELERY_RESULT_BACKEND: str = config('SHAKS_CELERY_RESULT_BACKEND', default='redis://localhost:6379/1')
CHANNEL_LAYER_URL: str = config('SHAKS_CHANNEL_LAYER_URL', default='redis://localhost:6379/2')

#Email 
EMAIL_HOST: str = config('SHAKS_EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT: int = config('SHAKS_EMAIL_PORT', default=587, cast=int)
EMAIL_HOST_USER: str = config('SHAKS_EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD: str = config('SHAKS_EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS: bool = config('SHAKS_EMAIL_USE_TLS', default=True, cast=bool)
DEFAULT_FROM_EMAIL: str = config('SHAKS_DEFAULT_FROM_EMAIL', default='noreply@shaks.edu')

#Flower
FLOWER_USER: str = config('SHAKS_FLOWER_USER', default='admin')
FLOWER_PASSWORD: str = config('SHAKS_FLOWER_PASSWORD', default='changeme')

#Seed
SEED_DB: bool = config('SHAKS_SEED_DB', default=False, cast=bool)
