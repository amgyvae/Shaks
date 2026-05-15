"""
Management command to seed the database with realistic test data.
Usage: python manage.py seed
"""
from __future__ import annotations

import logging
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

logger = logging.getLogger('apps.accounts')
User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with realistic test data for all models.'

    def handle(self, *args, **options) -> None:
        self.stdout.write('Seeding database...')
        self._create_grades()
        self._create_subjects()
        self._create_users()
        self._create_modules_and_topics()
        self._create_assignments()
        self._create_announcements()
        self._create_meetings()
        self._create_social_posts()
        self._create_notifications()
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def _create_grades(self) -> None:
        from apps.courses.models import Grade
        for n in range(1, 12):
            Grade.objects.get_or_create(name=f'Grade {n}')
        self.stdout.write('  Grades created.')

    def _create_subjects(self) -> None:
        from apps.courses.models import Subject
        subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History',
                    'Literature', 'English', 'Computer Science', 'Geography', 'Art']
        admin = User.objects.filter(role='admin').first()
        for s in subjects:
            Subject.objects.get_or_create(name=s, defaults={'created_by': admin})
        self.stdout.write('  Subjects created.')

    def _create_users(self) -> None:
        if not User.objects.filter(role='admin').exists():
            User.objects.create_superuser(
                phone_number='+70000000000',
                password='admin123',
                full_name='Admin User',
            )
        teachers = [
            ('+71111111111', 'Aizat Bekova', 'teacher'),
            ('+71111111112', 'Dauren Serik', 'teacher'),
        ]
        for phone, name, role in teachers:
            u, created = User.objects.get_or_create(phone_number=phone, defaults={'full_name': name, 'role': role, 'is_active': True})
            if created:
                u.set_password('teacher123')
                u.save()
        from apps.courses.models import Grade
        grades = list(Grade.objects.all())
        for i in range(1, 6):
            phone = f'+7222222222{i}'
            u, created = User.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'full_name': f'Student {i}',
                    'role': 'student',
                    'is_active': True,
                    'grade': random.choice(grades) if grades else None,
                },
            )
            if created:
                u.set_password('student123')
                u.save()
        self.stdout.write('  Users created.')

    def _create_modules_and_topics(self) -> None:
        from apps.courses.models import Grade, Subject, Module, Topic
        subject = Subject.objects.first()
        grade = Grade.objects.first()
        if not subject or not grade:
            return
        module, _ = Module.objects.get_or_create(
            title='Introduction Module',
            defaults={'subject': subject, 'grade': grade, 'order': 1},
        )
        for i in range(1, 4):
            Topic.objects.get_or_create(
                title=f'Topic {i}',
                module=module,
                defaults={'explanation': f'Explanation for topic {i}', 'order': i},
            )
        self.stdout.write('  Modules and topics created.')

    def _create_assignments(self) -> None:
        from apps.courses.models import Topic
        from apps.assignments.models import Assignment
        topic = Topic.objects.first()
        teacher = User.objects.filter(role='teacher').first()
        if not topic or not teacher:
            return
        for i in range(1, 4):
            Assignment.objects.get_or_create(
                title=f'Assignment {i}',
                defaults={
                    'topic': topic,
                    'instructions': f'Complete task {i}',
                    'points': 100,
                    'created_by': teacher,
                },
            )
        self.stdout.write('  Assignments created.')

    def _create_announcements(self) -> None:
        from apps.courses.models import Announcement
        admin = User.objects.filter(role='admin').first()
        if not admin:
            return
        for i in range(1, 3):
            Announcement.objects.get_or_create(
                title=f'Announcement {i}',
                defaults={'body': f'Body of announcement {i}', 'author': admin},
            )
        self.stdout.write('  Announcements created.')

    def _create_meetings(self) -> None:
        from apps.meetings.models import Meeting
        teacher = User.objects.filter(role='teacher').first()
        if not teacher:
            return
        Meeting.objects.get_or_create(
            title='Weekly Standup',
            defaults={
                'description': 'Weekly teacher meeting',
                'meeting_link': 'https://meet.google.com/example',
                'scheduled_at': timezone.now() + timezone.timedelta(days=1),
                'created_by': teacher,
            },
        )
        self.stdout.write('  Meetings created.')

    def _create_social_posts(self) -> None:
        from apps.social.models import Post
        for user in User.objects.filter(is_active=True)[:3]:
            Post.objects.get_or_create(
                author=user,
                text=f'Hello from {user.full_name}! This is a test post.',
            )
        self.stdout.write('  Social posts created.')

    def _create_notifications(self) -> None:
        from apps.notifications.models import Notification
        for user in User.objects.filter(is_active=True)[:3]:
            Notification.objects.get_or_create(
                recipient=user,
                title='Welcome to Shaks!',
                defaults={'body': 'Your account is ready. Start learning!'},
            )
        self.stdout.write('  Notifications created.')
