from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Grade(models.Model):
    name = models.CharField(_('name'), max_length=50, unique=True, help_text=_('Grade name, e.g. "Grade 10".'))

    class Meta:
        verbose_name = _('grade')
        verbose_name_plural = _('grades')
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class Subject(models.Model):
    name = models.CharField(_('name'), max_length=100, unique=True, db_index=True)
    description = models.TextField(_('description'), blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_('created by'),
        related_name='created_subjects',
    )

    class Meta:
        verbose_name = _('subject')
        verbose_name_plural = _('subjects')
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class Module(models.Model):
    title = models.CharField(_('title'), max_length=200, db_index=True)
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name='modules', verbose_name=_('subject'),
    )
    grade = models.ForeignKey(
        Grade, on_delete=models.CASCADE, related_name='modules', verbose_name=_('grade'),
    )
    order = models.PositiveIntegerField(_('order'), default=0, help_text=_('Display order within the subject.'))

    class Meta:
        verbose_name = _('module')
        verbose_name_plural = _('modules')
        ordering = ['order']
        indexes = [models.Index(fields=['subject', 'grade'], name='module_subject_grade_idx')]

    def __str__(self) -> str:
        return self.title


class Topic(models.Model):
    title = models.CharField(_('title'), max_length=200, db_index=True)
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='topics', verbose_name=_('module'),
    )
    video_url = models.URLField(_('video URL'), blank=True, help_text=_('External video URL (YouTube, Vimeo, etc.)'))
    video_file = models.FileField(
        _('video file'), upload_to='topic_videos/', blank=True, null=True,
        help_text=_('Uploaded video file (optional alternative to URL).'),
    )
    explanation = models.TextField(_('explanation'), blank=True)
    example = models.TextField(_('example'), blank=True)
    order = models.PositiveIntegerField(_('order'), default=0)

    class Meta:
        verbose_name = _('topic')
        verbose_name_plural = _('topics')
        ordering = ['order']
        indexes = [models.Index(fields=['module', 'order'], name='topic_module_order_idx')]

    def __str__(self) -> str:
        return self.title


class VideoWatch(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='video_watches',
        verbose_name=_('student'),
    )
    topic = models.ForeignKey(
        Topic, on_delete=models.CASCADE, related_name='watches', verbose_name=_('topic'),
    )
    watched_at = models.DateTimeField(_('watched at'), auto_now_add=True)

    class Meta:
        verbose_name = _('video watch')
        verbose_name_plural = _('video watches')
        unique_together = ('student', 'topic')
        ordering = ['-watched_at']

    def __str__(self) -> str:
        return f'{self.student} watched {self.topic}'


class Announcement(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name=_('author'),
        related_name='announcements',
    )
    title = models.CharField(_('title'), max_length=200)
    body = models.TextField(_('body'))
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('announcement')
        verbose_name_plural = _('announcements')
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title