from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import GeneratedModel
from users.models import User
from users.serializers import UserSerializer
from .serializers import UploadedImageSerializer, GeneratedModelSerializer
from django.conf import settings
import os

# Create your views here.
GENERATION_COST = settings.MODEL_GENERATION_COST


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_image_view(request):
    """
    Handle user image uploads for future 3D model generation.

    This endpoint:
        - Accepts multipart/form-data with an image file.
        - Validates file format (jpg/png/webp) and size (max 10MB).
        - Saves the image under the user's directory.
        - Returns the uploaded image metadata (ID, URL, timestamp).

    Expected Input:
        image: <IMAGE_FILE>

    Returns:
        201 Created:
            {
                "id": 5,
                "image": "http://.../media/uploads/1/input/filename.png",
                "uploaded_at": "2025-01-01T12:00:00Z"
            }
        400 Bad Request:
            {"image": ["Only JPG, PNG, and WEBP image formats are allowed."]}
    """
    serializer = UploadedImageSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def image_to_3d_placeholder_view(request):
    """
    Handle image-to-3D generation requests with placeholder logic.

    This endpoint:
    - Accepts an uploaded image file in 'image' field.
    - Saves the image and creates a GeneratedModel instance.
    - Assigns a static placeholder 3D file to 'model_file'.
    - Returns the serialized instance including a public URL to the 3D file.

    The 3D processing itself is NOT real yet; it simply attaches a fixed
    placeholder .glb/.obj file placed in MEDIA_ROOT/models/.
    """
    user = request.user
    if user.credits < GENERATION_COST:
        return Response(
            {"detail": "Insufficient credits. Please upgrade your plan."},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    image = request.FILES.get("image")

    if not image:
        return Response(
            {"detail": "No image file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create the GeneratedModel with the input image
    generated = GeneratedModel.objects.create(
        user=user,
        input_image=image,
        status="completed",  # since it's placeholder for now
    )

    # Deduct user credits
    user.credits -= 10
    user.save()

    # Attach placeholder 3D file (you must put this file in MEDIA_ROOT/models/)
    placeholder_rel_path = "models/placeholder.obj"  # or .obj, etc.
    placeholder_abs_path = os.path.join(settings.MEDIA_ROOT, placeholder_rel_path)

    # Make sure the placeholder file exists in your MEDIA_ROOT/models directory
    if os.path.exists(placeholder_abs_path):
        generated.model_file.name = placeholder_rel_path
        generated.save(update_fields=["model_file"])
    else:
        # If placeholder is missing, indicate failure
        generated.status = "failed"
        generated.save(update_fields=["status"])
        return Response(
            {"detail": "Placeholder 3D file not found on server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    serializer = GeneratedModelSerializer(generated, context={"request": request})
    user_serializer = UserSerializer(user)

    # Also return a direct URL convenience key
    file_url = request.build_absolute_uri(generated.model_file.url)

    return Response(
        {
            "detail": "3D model generated (placeholder).",
            "data": serializer.data,
            "file_url": file_url,
            "user": user_serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )
