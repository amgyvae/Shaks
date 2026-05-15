import logging

from celery import shared_task
from django.template.loader import render_to_string
from django.utils.translation import activate, gettext as _
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger('apps.accounts')


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    max_retries=3,
    name='accounts.send_welcome_email',
)
def send_welcome_email(self, user_id: int) -> None:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning('send_welcome_email: user %d not found', user_id)
        return

    activate(user.preferred_language or 'en')
    logger.info('Sending welcome email to user %d (%s)', user_id, user.identifier)

    subject = render_to_string('emails/welcome/subject.txt', {'user': user}).strip()
    body = render_to_string('emails/welcome/body.html', {'user': user})

    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email] if user.email else [],
        html_message=body,
        fail_silently=False,
    )
    logger.info('Welcome email sent to user %d', user_id)
