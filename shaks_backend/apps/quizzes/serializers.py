from rest_framework import serializers

from apps.quizzes.models import Quiz, QuizAttempt


class QuizReadSerializer(serializers.ModelSerializer):
    """GET for teachers/admins — includes correct answer."""
    class Meta:
        model = Quiz
        fields = ('id', 'topic', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')
        read_only_fields = fields


class QuizStudentReadSerializer(serializers.ModelSerializer):
    """GET for students — hides correct answer."""
    class Meta:
        model = Quiz
        fields = ('id', 'topic', 'question', 'option_a', 'option_b', 'option_c', 'option_d')
        read_only_fields = fields


class QuizWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ('topic', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer')


class QuizAttemptReadSerializer(serializers.ModelSerializer):
    is_correct = serializers.BooleanField(read_only=True)
    correct_answer = serializers.CharField(source='quiz.correct_answer', read_only=True)
    question = serializers.CharField(source='quiz.question', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ('id', 'quiz', 'question', 'answer', 'is_correct', 'correct_answer', 'attempted_at')
        read_only_fields = fields


class QuizAttemptWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ('quiz', 'answer')