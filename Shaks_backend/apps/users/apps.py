'''
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import TeacherProfile
from django.conf import settings

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_teacher_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'teacher':
        TeacherProfile.objects.create(user=instance)
'''