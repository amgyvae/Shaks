import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.env.local')

app = Celery('shaks')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

app.conf.beat_schedule = {
    'clear-expired-notifications-daily': {
        'task': 'apps.notifications.tasks.clear_expired_notifications',
        'schedule': crontab(hour=3, minute=0),
        'options': {'expires': 60},
    },
    'generate-daily-stats': {
        'task': 'apps.notifications.tasks.generate_daily_stats',
        'schedule': crontab(hour=0, minute=0),
        'options': {'expires': 60},
    },
}

app.conf.timezone = 'Asia/Almaty'
