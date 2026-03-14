from django.db import models
from django.contrib.auth.models import AbstractUser

from django.conf import settings


# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("admin", "Admin")
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.user.username


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatar/", null=True, blank=True)
    experience_years = models.IntegerField(default=0)

    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class StudentProgress(models.Model):
    student = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="progress")
    lesson = models.CharField(max_length=255)
    score = models.IntegerField()
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.user.username} - {self.lesson}"


class Assignment(models.Model):
    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.CASCADE,
        related_name="assignments"
    )
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="assignments/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Submission(models.Model):
    student = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="submissions"
    )

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions"
    )

    file = models.FileField(upload_to="submissions/")

    grade = models.IntegerField(null=True, blank=True)

    feedback = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.username} - {self.assignment.title}"

# class Submission(models.Model):
#     student = models.ForeignKey(
#         Profile,
#         on_delete=models.CASCADE,
#         related_name="submissions"
#     )
#     assignment = models.ForeignKey(
#         Assignment,
#         on_delete=models.CASCADE,
#         related_name="submissions"
#     )
#     file = models.FileField(upload_to="submissions/")
#     grade = models.IntegerField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.student.user.username} - {self.assignment.title}"
