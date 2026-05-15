import json
import logging
from datetime import timedelta

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger('apps.notifications')


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
    name='notifications.process_new_chat_message',
)
def process_new_chat_message(self, message_id: int) -> None:
    from apps.chat.models import ChatMessage
    from apps.notifications.models import Notification

    try:
        msg = ChatMessage.objects.select_related('sender', 'room__teacher', 'room__student').get(pk=message_id)
    except ChatMessage.DoesNotExist:
        logger.warning('process_new_chat_message: message %d not found', message_id)
        return

    recipient = msg.room.teacher if msg.sender == msg.room.student else msg.room.student

    Notification.objects.create(
        recipient=recipient,
        title=f'New message from {msg.sender.full_name}',
        body=msg.content[:200],
    )
    logger.info('Notification created for user %d (message %d)', recipient.pk, message_id)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
    name='notifications.clear_expired_notifications',
)
def clear_expired_notifications(self) -> None:
    cutoff = timezone.now() - timedelta(days=30)
    from apps.notifications.models import Notification
    deleted, _ = Notification.objects.filter(created_at__lt=cutoff).delete()
    logger.info('Cleared %d expired notifications (older than %s)', deleted, cutoff.date())


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
    name='notifications.generate_daily_stats',
)
def generate_daily_stats(self) -> None:
    from django.contrib.auth import get_user_model
    from apps.assignments.models import Submission
    from apps.social.models import Post

    User = get_user_model()
    since = timezone.now() - timedelta(days=1)

    new_users = User.objects.filter(date_joined__gte=since).count()
    new_submissions = Submission.objects.filter(submitted_at__gte=since).count()
    new_posts = Post.objects.filter(created_at__gte=since).count()

    logger.info(
        'Daily stats — new users: %d, new submissions: %d, new posts: %d',
        new_users, new_submissions, new_posts,
    )
