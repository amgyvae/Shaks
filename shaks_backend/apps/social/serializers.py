from rest_framework import serializers

from apps.social.models import Post, Like, Comment


class CommentReadSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'author_id', 'author_name', 'text', 'created_at')
        read_only_fields = fields


class CommentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('text',)


class PostReadSerializer(serializers.ModelSerializer):
    """GET — includes nested comments (M2M-like), like count, is_liked annotation."""
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    author_id = serializers.IntegerField(source='author.id', read_only=True)
    likes_count = serializers.IntegerField(read_only=True, default=0)
    comments_count = serializers.IntegerField(read_only=True, default=0)
    comments = CommentReadSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'author_id', 'author_name',
            'text', 'image', 'created_at',
            'likes_count', 'comments_count', 'is_liked', 'comments',
        )
        read_only_fields = fields

    def get_is_liked(self, obj: Post) -> bool:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class PostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('text', 'image')