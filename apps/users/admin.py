from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import Profile
from .models import (
    User,
    Profile,
    TeacherProfile,
    StudentProgress,
    Assignment,
)
from .models import Submission

class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("student", "assignment", "grade", "submitted_at")
    fields = ("student", "assignment", "file", "grade", "feedback", "submitted_at")
    readonly_fields = ("submitted_at",)

    def get_queryset(self, request):
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs

        return qs.filter(assignment__teacher__user=request.user)


User = get_user_model()


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Role", {"fields": ("role",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Role", {"fields": ("role",)}),
    )


admin.site.register(Profile)
admin.site.register(TeacherProfile)
admin.site.register(StudentProgress)
admin.site.register(Assignment)
admin.site.register(Submission, SubmissionAdmin)

