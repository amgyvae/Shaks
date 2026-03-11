from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import User, TeacherProfile


# @receiver(post_save, sender=User)
# def create_profiles(sender, instance, created, **kwargs):
#     if created:
#         if instance.role == "teacher":
#             TeacherProfile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_teacher_profile(sender, instance, created, **kwargs):

    if created and instance.role == "teacher":

        TeacherProfile.objects.create(user=instance)