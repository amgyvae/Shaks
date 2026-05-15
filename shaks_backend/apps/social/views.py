import logging

from django.db.models import Count
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from apps.core.decorators import SerializerByActionMixin
from apps.social.models import Post, Like, Comment
from apps.social.serializers import PostReadSerializer, PostWriteSerializer, CommentWriteSerializer, CommentReadSerializer

logger = logging.getLogger('apps.social')


class PostViewSet(SerializerByActionMixin, viewsets.ModelViewSet):
    serializer_class = PostReadSerializer
    serializer_classes = {
        'create': PostWriteSerializer,
        'update': PostWriteSerializer,
        'partial_update': PostWriteSerializer,
    }
    filterset_fields = ['author']
    search_fields = ['text']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return (
            Post.objects
            .select_related('author')
            .prefetch_related('comments__author', 'likes')
            .annotate(
                likes_count=Count('likes', distinct=True),
                comments_count=Count('comments', distinct=True),
            )
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
        logger.info('Post created by %s', self.request.user.identifier)

    @extend_schema(summary='List posts', tags=['Social'], responses={200: PostReadSerializer(many=True)})
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(summary='Create post', tags=['Social'], request=PostWriteSerializer, responses={201: PostReadSerializer})
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(summary='Get post detail', tags=['Social'], responses={200: PostReadSerializer})
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(summary='Update post', tags=['Social'], request=PostWriteSerializer, responses={200: PostReadSerializer, 403: OpenApiResponse(description='Not the owner')})
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(summary='Delete post', tags=['Social'], responses={204: None, 403: OpenApiResponse(description='Not the owner')})
    def destroy(self, request, *args, **kwargs):
        logger.info('Post %s deleted by %s', kwargs.get('pk'), request.user.identifier)
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        summary='Like / unlike post',
        tags=['Social'],
        responses={200: OpenApiResponse(description='{"liked": true|false}')},
    )
    @action(detail=True, methods=['post'])
    def like(self, request: Request, pk=None) -> Response:
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'liked': False})
        return Response({'liked': True})

    @extend_schema(
        summary='Comment on post',
        tags=['Social'],
        request=CommentWriteSerializer,
        responses={201: CommentReadSerializer, 400: OpenApiResponse(description='Validation error')},
    )
    @action(detail=True, methods=['post'])
    def comment(self, request: Request, pk=None) -> Response:
        post = self.get_object()
        serializer = CommentWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(author=request.user, post=post)
        logger.info('Comment on post %s by %s', pk, request.user.identifier)
        return Response(CommentReadSerializer(comment).data, status=status.HTTP_201_CREATED)