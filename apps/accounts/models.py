import logging
from typing import Optional

import pytz
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

logger = logging.getLogger('apps.accounts')

SUPPORTED_LANGUAGES = [('en', _('English')), ('ru', _('Russian')), ('kk', _('Kazakh'))]
TIMEZONE_CHOICES = [(tz, tz) for tz in pytz.common_timezones]

phone_validator = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message=_('Phone number must be entered in format: +999999999. Up to 15 digits allowed.'),
)


class UserManager(BaseUserManager):
    def create_user(
        self,
        phone_number: str,
        password: Optional[str] = None,
        **extra_fields,
    ) -> 'User':
        if not phone_number:
            raise ValueError(_('Phone number is required.'))
        user: User = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        logger.info('User created: %s', phone_number)
        return user

    def create_superuser(
        self,
        phone_number: str,
        password: Optional[str] = None,
        **extra_fields,
    ) -> 'User':
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class RoleChoices(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        TEACHER = 'teacher', _('Teacher')
        STUDENT = 'student', _('Student')

    full_name = models.CharField(
        _('full name'),
        max_length=255,
        help_text=_('First and last name of the user.'),
        db_index=True,
    )
    phone_number = models.CharField(
        _('phone number'),
        max_length=20,
        unique=True,
        blank=True,
        null=True,
        validators=[phone_validator],
        help_text=_('Primary login field. Format: +77001234567.'),
        db_index=True,
    )
    email = models.EmailField(
        _('email address'),
        unique=True,
        blank=True,
        null=True,
        help_text=_('Email address of the user.'),
        db_index=True,
    )

    role = models.CharField(
        _('role'),
        max_length=10,
        choices=RoleChoices.choices,
        default=RoleChoices.STUDENT,
        help_text=_('User role determines access level within the LMS.'),
        db_index=True,
    )
    grade = models.ForeignKey(
        'courses.Grade',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        verbose_name=_('grade'),
        help_text=_('School grade the student belongs to (students only).'),
    )

    avatar = models.ImageField(
        _('avatar'),
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text=_('Profile picture. Accepted formats: JPEG, PNG.'),
    )

    preferred_language = models.CharField(
        _('preferred language'),
        max_length=5,
        choices=SUPPORTED_LANGUAGES,
        default='en',
        help_text=_('Language used for API responses and emails.'),
    )
    timezone = models.CharField(
        _('timezone'),
        max_length=64,
        default='Asia/Almaty',
        choices=TIMEZONE_CHOICES,
        help_text=_('IANA timezone identifier, e.g. Asia/Almaty.'),
    )

    is_active = models.BooleanField(
        _('active'),
        default=False,
        help_text=_('Inactive until the user activates their account.'),
    )
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into the admin site.'),
    )
    date_joined = models.DateTimeField(
        _('date joined'),
        auto_now_add=True,
        help_text=_('Timestamp when the account was created.'),
    )

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['role'], name='user_role_idx'),
            models.Index(fields=['phone_number'], name='user_phone_idx'),
        ]
        permissions = [
            ('can_create_course', 'Can create course content'),
            ('can_grade_submission', 'Can grade student submissions'),
        ]

    def __str__(self) -> str:
        return f'{self.full_name} ({self.phone_number or self.email})'

    @property
    def identifier(self) -> str:
        """Return the best available contact identifier."""
        return self.phone_number or self.email or str(self.pk)
