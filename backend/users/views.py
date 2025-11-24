from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer,
)

from .auth import verify_google_token

User = get_user_model()


# ----------------------- Helper: Token Generator -----------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# ----------------------- Register -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens})
    return Response(serializer.errors, status=400)


# ----------------------- Login -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(email=email, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=400)

    tokens = get_tokens_for_user(user)
    return Response({"user": UserSerializer(user).data, "tokens": tokens})


# ----------------------- Google Login -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login_view(request):
    token = request.data.get("token")
    idinfo = verify_google_token(token)

    if not idinfo:
        return Response({"detail": "Invalid Google token"}, status=400)

    email = idinfo.get("email")
    google_id = idinfo.get("sub")

    user, created = User.objects.get_or_create(
        email=email,
        defaults={"google_id": google_id},
    )

    if created:
        user.set_unusable_password()
        user.save()

    tokens = get_tokens_for_user(user)
    return Response({"user": UserSerializer(user).data, "tokens": tokens})

# ----------------------- Logout -----------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get("refresh")

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"detail": "Logged out successfully."})
    except:
        return Response({"detail": "Invalid token"}, status=400)


# ----------------------- Profile: GET / UPDATE -----------------------
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    if request.method == "GET":
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    if request.method == "PUT":
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ----------------------- Change Password -----------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        old_pw = serializer.validated_data["old_password"]
        new_pw = serializer.validated_data["new_password"]

        if not request.user.check_password(old_pw):
            return Response({"detail": "Old password is incorrect."}, status=400)

        request.user.set_password(new_pw)
        request.user.save()

        return Response({"detail": "Password updated successfully."})

    return Response(serializer.errors, status=400)


# ----------------------- Request Password Reset -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "No account exists with this email address."})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)

    reset_url = f"{request.build_absolute_uri('/')}reset-password?uid={uid}&token={token}"

    send_mail(
        "Password Reset",
        f"Reset your password: {reset_url}",
        "ahsanm7911@gmail.com",
        [email],
        fail_silently=True,
    )

    return Response({"detail": "If this email exists, a reset link will be sent."})


# ----------------------- Reset Password -----------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password_view(request):
    serializer = PasswordResetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    uidb64 = serializer.validated_data['uid']
    token = serializer.validated_data['token']
    new_password = serializer.validated_data['new_password']

    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except:
        return Response({"detail": "Invalid link"}, status=400)

    if not PasswordResetTokenGenerator().check_token(user, token):
        return Response({"detail": "Invalid or expired token"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password has been reset successfully."})
