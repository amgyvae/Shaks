import logging

from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import (
    extend_schema, OpenApiExample, OpenApiResponse, OpenApiParameter,
)
from rest_framework import generics, status, permissions
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import (
    UserReadSerializer, UserCreateSerializer, ProfileUpdateSerializer,
    ActivateAccountSerializer, LoginSerializer,
    LanguagePreferenceSerializer, TimezonePreferenceSerializer,
    TokenResponseSerializer,
)
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher

logger = logging.getLogger('apps.accounts')

User = get_user_model()


def _find_user(identifier: str):
    if '@' in identifier:
        return User.objects.filter(email__iexact=identifier).first()
    return User.objects.filter(phone_number=identifier).first()


def _get_tokens(user) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminOrTeacher]

    @extend_schema(
        summary='Create user',
        description=(
            'Admin or teacher creates a user account. The account is inactive '
            'until the user activates it via POST /api/auth/register/. '
            'Permission: IsAdminOrTeacher.'
        ),
        tags=['Auth'],
        responses={
            201: UserReadSerializer,
            400: OpenApiResponse(description='Validation error'),
            401: OpenApiResponse(description='Authentication required'),
            403: OpenApiResponse(description='Admin or teacher role required'),
        },
        examples=[
            OpenApiExample(
                'Create student',
                request_only=True,
                value={'full_name': 'Asel Nurova', 'phone_number': '+77001234567', 'role': 'student'},
            ),
        ],
    )
    def post(self, request: Request, *args, **kwargs) -> Response:
        logger.info('User creation attempt by %s', request.user)
        return super().post(request, *args, **kwargs)


class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Activate account / Register',
        description=(
            'First-time login. Student enters their phone/email and sets a password. '
            'Returns JWT tokens on success. '
            'Rate limited: 5 requests/minute per IP. '
            'Permission: public.'
        ),
        tags=['Auth'],
        request=ActivateAccountSerializer,
        responses={
            200: TokenResponseSerializer,
            400: OpenApiResponse(description='Validation error or already activated'),
            429: OpenApiResponse(description='Rate limit exceeded'),
        },
        examples=[
            OpenApiExample(
                'Activate',
                request_only=True,
                value={'identifier': '+77001234567', 'password': 'securepass'},
            ),
            OpenApiExample(
                'Success response',
                response_only=True,
                value={'detail': 'Account activated.', 'access': '<token>', 'refresh': '<token>'},
            ),
        ],
    )
    def post(self, request: Request) -> Response:
        logger.info('Activation attempt for identifier: %s', request.data.get('identifier'))
        serializer = ActivateAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier: str = serializer.validated_data['identifier']
        password: str = serializer.validated_data['password']
        user = _find_user(identifier)
        user.set_password(password)
        user.is_active = True
        user.save()
        logger.info('Account activated: %s', identifier)
        return Response({'detail': _('Account activated.'), **_get_tokens(user)}, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary='Login',
        description=(
            'Authenticate with phone/email and password. Returns JWT tokens + user data. '
            'Rate limited: 10 requests/minute per IP. '
            'Permission: public.'
        ),
        tags=['Auth'],
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description='Tokens + user data'),
            401: OpenApiResponse(description='Invalid credentials'),
            403: OpenApiResponse(description='Account not activated'),
            429: OpenApiResponse(description='Rate limit exceeded'),
        },
        examples=[
            OpenApiExample(
                'Login request',
                request_only=True,
                value={'identifier': '+77001234567', 'password': 'mypassword'},
            ),
        ],
    )
    def post(self, request: Request) -> Response:
        logger.info('Login attempt for: %s', request.data.get('identifier'))
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier: str = serializer.validated_data['identifier']
        password: str = serializer.validated_data['password']
        user = _find_user(identifier)
        if not user or not user.check_password(password):
            logger.warning('Failed login attempt for: %s', identifier)
            return Response({'detail': _('Invalid credentials.')}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response(
                {'detail': _('Account not activated. Please activate first.')},
                status=status.HTTP_403_FORBIDDEN,
            )
        logger.info('Successful login: %s', identifier)
        return Response({'user': UserReadSerializer(user, context={'request': request}).data, **_get_tokens(user)})


class MeView(APIView):
    @extend_schema(
        summary='Get own profile',
        description='Retrieve the authenticated user\'s profile. Permission: IsAuthenticated.',
        tags=['Auth'],
        responses={200: UserReadSerializer, 401: OpenApiResponse(description='Not authenticated')},
    )
    def get(self, request: Request) -> Response:
        return Response(UserReadSerializer(request.user, context={'request': request}).data)

    @extend_schema(
        summary='Update own profile',
        description='Partially update the authenticated user\'s profile. Permission: IsAuthenticated.',
        tags=['Auth'],
        request=ProfileUpdateSerializer,
        responses={
            200: UserReadSerializer,
            400: OpenApiResponse(description='Validation error'),
            401: OpenApiResponse(description='Not authenticated'),
        },
    )
    def patch(self, request: Request) -> Response:
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.info('Profile updated: %s', request.user.identifier)
        return Response(UserReadSerializer(request.user, context={'request': request}).data)


class LanguagePreferenceView(APIView):
    @extend_schema(
        summary='Update language preference',
        description=(
            'Set the user\'s preferred language (en, ru, kk). '
            'This language is used for API responses, emails and date formatting. '
            'Permission: IsAuthenticated.'
        ),
        tags=['Auth'],
        request=LanguagePreferenceSerializer,
        responses={
            200: OpenApiResponse(description='Language updated'),
            400: OpenApiResponse(description='Invalid language code'),
            401: OpenApiResponse(description='Not authenticated'),
        },
        examples=[
            OpenApiExample('Set Russian', request_only=True, value={'language': 'ru'}),
        ],
    )
    def patch(self, request: Request) -> Response:
        serializer = LanguagePreferenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lang: str = serializer.validated_data['language']
        request.user.preferred_language = lang
        request.user.save(update_fields=['preferred_language'])
        logger.info('Language preference updated to %s for user %s', lang, request.user.identifier)
        return Response({'detail': _('Language updated.'), 'language': lang})


class TimezonePreferenceView(APIView):
    @extend_schema(
        summary='Update timezone preference',
        description=(
            'Set the user\'s IANA timezone. Dates in API responses will be converted '
            'to this timezone. '
            'Permission: IsAuthenticated.'
        ),
        tags=['Auth'],
        request=TimezonePreferenceSerializer,
        responses={
            200: OpenApiResponse(description='Timezone updated'),
            400: OpenApiResponse(description='Invalid IANA timezone'),
            401: OpenApiResponse(description='Not authenticated'),
        },
        examples=[
            OpenApiExample('Set Almaty', request_only=True, value={'timezone': 'Asia/Almaty'}),
        ],
    )
    def patch(self, request: Request) -> Response:
        serializer = TimezonePreferenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tz: str = serializer.validated_data['timezone']
        request.user.timezone = tz
        request.user.save(update_fields=['timezone'])
        logger.info('Timezone updated to %s for user %s', tz, request.user.identifier)
        return Response({'detail': _('Timezone updated.'), 'timezone': tz})


class UserListView(generics.ListAPIView):
    serializer_class = UserReadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role']
    search_fields = ['full_name', 'phone_number', 'email']
    ordering_fields = ['date_joined', 'full_name']

    def get_queryset(self):
        return User.objects.select_related('grade').all()

    @extend_schema(
        summary='List users',
        description='List all users. Filter with ?role=student|teacher|admin. Permission: IsAuthenticated.',
        tags=['Auth'],
        parameters=[
            OpenApiParameter('role', description='Filter by role', required=False, type=str),
            OpenApiParameter('search', description='Search by name/phone/email', required=False, type=str),
        ],
        responses={200: UserReadSerializer(many=True), 401: OpenApiResponse(description='Not authenticated')},
    )
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = User.objects.select_related('grade').all()

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return ProfileUpdateSerializer
        return UserReadSerializer

    @extend_schema(tags=['Auth'], summary='Get user detail', responses={200: UserReadSerializer})
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=['Auth'], summary='Update user', request=ProfileUpdateSerializer, responses={200: UserReadSerializer})
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(tags=['Auth'], summary='Delete user', responses={204: None, 403: OpenApiResponse(description='Admin only')})
    def delete(self, request, *args, **kwargs):
        logger.info('User deletion by admin %s: pk=%s', request.user.identifier, kwargs.get('pk'))
        return super().delete(request, *args, **kwargs)


class AssignGradeView(APIView):
    permission_classes = [IsAdminOrTeacher]
    serializer_class = UserReadSerializer

    @extend_schema(
        summary='Assign grade to student',
        description='Assign or remove a school grade from a student user. Permission: IsAdminOrTeacher.',
        tags=['Auth'],
        responses={
            200: UserReadSerializer,
            400: OpenApiResponse(description='Validation error'),
            403: OpenApiResponse(description='Admin or teacher required'),
            404: OpenApiResponse(description='Student or grade not found'),
        },
    )
    def patch(self, request: Request, pk: int) -> Response:
        try:
            student = User.objects.get(pk=pk, role='student')
        except User.DoesNotExist:
            return Response({'detail': _('Student not found.')}, status=status.HTTP_404_NOT_FOUND)
        grade_id = request.data.get('grade')
        if grade_id is None:
            student.grade = None
        else:
            from apps.courses.models import Grade
            try:
                student.grade = Grade.objects.get(pk=grade_id)
            except Grade.DoesNotExist:
                return Response({'detail': _('Grade not found.')}, status=status.HTTP_404_NOT_FOUND)
        student.save()
        logger.info('Grade assigned to student %s by %s', pk, request.user.identifier)
        return Response(UserReadSerializer(student).data)
