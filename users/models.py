from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )
    role = models.CharField(max_length = 10, choices = ROLE_CHOICES)

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete = models.CASCADE)
    bio = models.TextField(blank = True)
    avatar = models.ImageField(upload_to = 'avatars/', blank = True, null = True)
    phone = models.CharField(max_length = 20, blank = True)
    def __str__(self):
        return self.user.username