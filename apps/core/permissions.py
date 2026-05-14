"""Global custom DRF permissions."""
from __future__ import annotations

from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.request import Request


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: allow read to anyone; write only to the owner.

    The view must pass the owner field name in ``owner_field`` attribute
    (defaults to ``'created_by'``).

    Permission description (included in Swagger):
    - GET/HEAD/OPTIONS: open to all authenticated users
    - POST/PUT/PATCH/DELETE: restricted to the object owner
    """

    message = 'You must be the owner of this object to modify it.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request: Request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        owner_field: str = getattr(view, 'owner_field', 'created_by')
        return getattr(obj, owner_field, None) == request.user


class IsAdminRole(BasePermission):
    """Allow access only to users with role='admin'."""

    message = 'Admin role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'admin'
        )


class IsTeacherOrAdmin(BasePermission):
    """Allow access to users with role='teacher' or role='admin'."""

    message = 'Teacher or admin role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('teacher', 'admin')
        )


class IsSelfOrAdmin(BasePermission):
    """
    Object-level: allow users to access their own record;
    admins can access any record.
    """

    message = 'You can only access your own data.'

    def has_object_permission(self, request: Request, view, obj) -> bool:
        if getattr(request.user, 'role', None) == 'admin':
            return True
        return obj == request.user
