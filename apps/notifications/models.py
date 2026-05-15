from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('recipient'),
        help_text=_('The user who receives this notification.'),
        db_index=True,
    )
    title = models.CharField(
        _('title'),
        max_length=200,
        help_text=_('Short notification title.'),
    )
    body = models.TextField(
        _('body'),
        blank=True,
        help_text=_('Full notification message body.'),
    )
    is_read = models.BooleanField(
        _('is read'),
        default=False,
        help_text=_('True once the user has viewed the notification.'),
        db_index=True,
    )
    created_at = models.DateTimeField(
        _('created at'),
        auto_now_add=True,
        help_text=_('When this notification was created.'),
        db_index=True,
    )

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read'], name='notif_recipient_read_idx'),
        ]

    def __str__(self) -> str:
        return f'{self.recipient} — {self.title}'
