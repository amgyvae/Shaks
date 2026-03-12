from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("admin", "Admin"),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.username} ({self.role})"

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