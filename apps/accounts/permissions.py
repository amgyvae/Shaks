from rest_framework.permissions import BasePermission
from rest_framework.request import Request


class IsAdmin(BasePermission):
    message = 'Admin role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'admin'
        )


class IsTeacher(BasePermission):
    message = 'Teacher role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'teacher'
        )


class IsStudent(BasePermission):
    message = 'Student role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'student'
        )


class IsAdminOrTeacher(BasePermission):
    message = 'Admin or teacher role required.'

    def has_permission(self, request: Request, view) -> bool:
        return bool(
            request.user and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('admin', 'teacher')
        )
