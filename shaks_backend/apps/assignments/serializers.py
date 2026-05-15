from rest_framework import serializers

from apps.assignments.models import Assignment, AssignmentView, Submission


class AssignmentReadSerializer(serializers.ModelSerializer):
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    module_title = serializers.CharField(source='topic.module.title', read_only=True)
    subject_name = serializers.CharField(source='topic.module.subject.name', read_only=True)
    grade_name = serializers.CharField(source='topic.module.grade.name', read_only=True)
    grade_id = serializers.IntegerField(source='topic.module.grade.id', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)

    class Meta:
        model = Assignment
        fields = (
            'id', 'title', 'instructions', 'description', 'points', 'due_date', 'task_file',
            'topic', 'topic_title', 'module_title', 'subject_name', 'grade_name', 'grade_id',
            'created_by', 'created_by_name', 'created_at',
        )
        read_only_fields = fields


class AssignmentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ('title', 'instructions', 'description', 'points', 'due_date', 'task_file', 'topic')


class SubmissionReadSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = Submission
        fields = (
            'id', 'student', 'student_name', 'assignment', 'assignment_title',
            'file', 'status', 'feedback', 'grade', 'submitted_at', 'reviewed_at',
        )
        read_only_fields = fields


class SubmissionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ('assignment', 'file')


class ReviewSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ('status', 'feedback', 'grade')


class AssignmentStudentRowSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    viewed = serializers.BooleanField()
    submitted = serializers.BooleanField()
    status = serializers.CharField()
    grade = serializers.CharField()
    feedback = serializers.CharField()
    submission_id = serializers.IntegerField(allow_null=True)
    image = serializers.CharField(allow_null=True)
    submitted_at = serializers.DateTimeField(allow_null=True)
