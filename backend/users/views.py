import requests
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import login
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_endpoint(request):
    print(f"Request: ", request)
    return Response({"detail": "Authorized"})
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response({'data': serializer.data}, status=status.HTTP_200_OK)

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
def google_login_view(request):
    print("Google client id: ", settings.GOOGLE_CLIENT_ID)
    print("Google redirect uri: ", settings.GOOGLE_REDIRECT_URI)
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return HttpResponseRedirect(google_auth_url)

def google_callback_view(request):
    code = request.GET.get("code")

    if not code:
        return JsonResponse({"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    token_res = requests.post(token_url, data=data).json()

    if "access_token" not in token_res:
        return JsonResponse({"error": "Failed to retrieve access token", "details": token_res}, status=status.HTTP_400_BAD_REQUEST)


    access_token = token_res.get("access_token")

    # fetch user info
    user_info = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    ).json()

    email = user_info.get('email')
    name = user_info.get('name', '')

    if not email:
        return JsonResponse({'error': "Google account has not email."}, status=status.HTTP_400_BAD_REQUEST)
    
    user, created = User.objects.get_or_create(
        email=email, 
        defaults={
            'email': email,
            'first_name': name.split()[0] if name else "",
            'last_name': " ".join(name.split()[1:]) if name and len(name.split()) > 1 else "",
        }
    )

    # Login the user (django session)
    login(request, user)

    token = get_tokens_for_user(user)['access']
    return HttpResponseRedirect(f"http://localhost:5173/auth-success?token={token}")
    

# ----------------------- Logout -----------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    print("Request: ", request)
    print(f"Request body: {request.body}")
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
        user = User.objects.get(id=request.user.id)
        serializer = UserProfileSerializer(user)
        print("Data from db: ", serializer.data)

        tokens = get_tokens_for_user(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens})


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
