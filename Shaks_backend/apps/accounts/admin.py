from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone_number', 'email', 'full_name', 'role', 'preferred_language', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'preferred_language')
    search_fields = ('phone_number', 'email', 'full_name')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined',)

    fieldsets = (
        (None, {'fields': ('phone_number', 'email', 'password')}),
        (_('Personal info'), {'fields': ('full_name', 'role', 'grade', 'avatar')}),
        (_('Preferences'), {'fields': ('preferred_language', 'timezone')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('date_joined',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'email', 'full_name', 'role', 'password1', 'password2'),
        }),
    )
