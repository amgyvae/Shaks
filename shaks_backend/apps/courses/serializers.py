from rest_framework import serializers

from apps.courses.models import Grade, Subject, Module, Topic, Announcement, VideoWatch


class GradeReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ('id', 'name')
        read_only_fields = fields


class SubjectReadSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Subject
        fields = ('id', 'name', 'description', 'created_by', 'created_by_name')
        read_only_fields = fields


class TopicReadSerializer(serializers.ModelSerializer):
    watch_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Topic
        fields = ('id', 'title', 'module', 'video_url', 'video_file', 'explanation', 'example', 'order', 'watch_count')
        read_only_fields = fields


class ModuleReadSerializer(serializers.ModelSerializer):
    """GET — includes nested topics, subject name, grade name (M2M-like FK fields)."""
    topics = TopicReadSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    topic_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Module
        fields = ('id', 'title', 'subject', 'subject_name', 'grade', 'grade_name', 'order', 'topics', 'topic_count')
        read_only_fields = fields


class ModuleListReadSerializer(serializers.ModelSerializer):
    """Lightweight list serializer — no nested topics."""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    topic_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Module
        fields = ('id', 'title', 'subject', 'subject_name', 'grade', 'grade_name', 'order', 'topic_count')
        read_only_fields = fields


class AnnouncementReadSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = Announcement
        fields = ('id', 'title', 'body', 'author', 'author_name', 'created_at')
        read_only_fields = fields



class GradeWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ('name',)


class SubjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('name', 'description')


class ModuleWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ('title', 'subject', 'grade', 'order')


class TopicWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ('title', 'module', 'video_url', 'video_file', 'explanation', 'example', 'order')


class AnnouncementWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ('title', 'body')