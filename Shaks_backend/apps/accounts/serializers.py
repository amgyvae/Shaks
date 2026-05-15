import logging

import pytz
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from apps.accounts.models import SUPPORTED_LANGUAGES

logger = logging.getLogger('apps.accounts')

User = get_user_model()

VALID_TIMEZONES: set[str] = set(pytz.all_timezones)



class UserReadSerializer(serializers.ModelSerializer):
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'full_name', 'phone_number', 'email', 'role',
            'grade', 'grade_name', 'avatar', 'avatar_url',
            'preferred_language', 'timezone',
            'is_active', 'date_joined',
        )
        read_only_fields = fields

    def get_avatar_url(self, obj: User) -> str | None:
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None



class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('full_name', 'phone_number', 'email', 'role', 'grade')

    def validate(self, data: dict) -> dict:
        if not data.get('phone_number') and not data.get('email'):
            raise serializers.ValidationError(
                _('Either phone number or email is required.')
            )
        return data

    def create(self, validated_data: dict) -> User:
        logger.info('Creating user: %s', validated_data.get('phone_number') or validated_data.get('email'))
        return User.objects.create_user(
            phone_number=validated_data.get('phone_number'),
            email=validated_data.get('email'),
            full_name=validated_data['full_name'],
            role=validated_data.get('role', 'student'),
            grade=validated_data.get('grade'),
        )


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('full_name', 'phone_number', 'email', 'avatar')

    def validate_phone_number(self, value: str) -> str:
        if value:
            qs = User.objects.filter(phone_number=value).exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(_('Phone number already in use.'))
        return value

    def validate_email(self, value: str) -> str:
        if value:
            qs = User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(_('Email already in use.'))
        return value


class ActivateAccountSerializer(serializers.Serializer):
    identifier = serializers.CharField(
        help_text=_('Phone number or email address.'),
    )
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        help_text=_('New password (minimum 6 characters).'),
    )

    def validate_identifier(self, value: str) -> str:
        from apps.accounts.views import _find_user
        user = _find_user(value)
        if not user:
            raise serializers.ValidationError(
                _('No account found with this phone number or email.')
            )
        if user.is_active:
            raise serializers.ValidationError(
                _('Account already activated. Please login.')
            )
        return value


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text=_('Phone number or email.'))
    password = serializers.CharField(write_only=True, help_text=_('Account password.'))


class LanguagePreferenceSerializer(serializers.Serializer):
    language = serializers.ChoiceField(
        choices=[code for code, _ in SUPPORTED_LANGUAGES],
        help_text=_('Language code: en, ru or kk.'),
    )


class TimezonePreferenceSerializer(serializers.Serializer):
    timezone = serializers.CharField(
        max_length=64,
        help_text=_('IANA timezone identifier, e.g. Asia/Almaty.'),
    )

    def validate_timezone(self, value: str) -> str:
        if value not in VALID_TIMEZONES:
            raise serializers.ValidationError(
                _(f'"{value}" is not a valid IANA timezone. '
                  'See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones')
            )
        return value


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
