from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.views import APIView
from adrf.decorators import api_view as adrf_api_view
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
import shutil
import base64
from pathlib import Path
from .services import generator, tripo_generator

# Create your views here.
GENERATION_COST = settings.MODEL_GENERATION_COST


def file_to_base64(file):
    """Convert UploadedFile to base64 safely"""
    file.seek(0)  # Reset file pointer
    file_content = file.read()
    return base64.b64encode(file_content).decode("utf-8")


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


@adrf_api_view(["POST"])
@permission_classes([IsAuthenticated])
async def image_to_3d_placeholder_view(request):
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

    from asgiref.sync import sync_to_async

    user = request.user
    if user.credits < GENERATION_COST:
        return Response(
            {"detail": "Insufficient credits. Please upgrade your plan."},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    image = request.FILES.get("image")
    # image = file_to_base64(image)

    if not image:
        return Response(
            {"detail": "No image file provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    generated = await sync_to_async(GeneratedModel.objects.create)(
        user=user, input_image=image, status="processing"
    )

    await sync_to_async(generated.save)()
    try:
        image = os.path.join(settings.MEDIA_ROOT, generated.input_image.url)[1:]
        shutil.copy2(image, Path(settings.BASE_DIR) / "temp.png")
        print("Copying done.")
    except Exception as e:
        print(f"Failed to copy: {e}")
    # Upload image and get token
    image_token = await tripo_generator.get_image_token(image)
    print(f"IMAGE_TOKEN: {image_token}")
    if not image_token:
        return Response(
            {"detail": "Failed to get image token."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    generated.image_token = image_token
    await sync_to_async(generated.save)(update_fields=["image_token"])

    output_folder = os.path.join(settings.MEDIA_ROOT, "models", str(user.id))

    if not os.path.exists(output_folder):
        print(f"Folder {output_folder} doesn't exists, creating....")
        os.makedirs(output_folder)
        print(f"Folder {output_folder} created.")

    try:
        generator_response = await tripo_generator.image_to_model_example(
            image=image_token, output_path=output_folder
        )
        # model_path = await tripo_generator.get_model_files(task_id, output_folder)
        print(f"GENERATOR RESPONSE: {generator_response}")
        task_id, model_path = generator_response
    except Exception as e:
        print(f"Generation Error: {e}")
        return Response(
            {"detail": "Generation service error"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if model_path and task_id:
        print(f"MODEL_PATH: {model_path}")
        # Add the model_path to generated_model
        generated.task_id = task_id
        generated.model_file = model_path
        await sync_to_async(generated.save)(update_fields=["model_file", "task_id"])
        # Deduct user credits
        user.credits -= 10
        await sync_to_async(user.save)()

        # Attach placeholder 3D file (you must put this file in MEDIA_ROOT/models/)
        placeholder_rel_path = model_path.split("backend")[-1].split("media")[-1][1:]
        placeholder_abs_path = os.path.join(settings.MEDIA_ROOT, placeholder_rel_path)

        # Make sure the placeholder file exists in your MEDIA_ROOT/models directory
        if os.path.exists(placeholder_abs_path):
            generated.model_file.name = placeholder_rel_path
            generated.status = "completed"
            await sync_to_async(generated.save)(update_fields=["model_file", "status"])
        else:
            # If placeholder is missing, indicate failure
            generated.status = "failed"
            await sync_to_async(generated.save)(update_fields=["status"])
            return Response(
                {"detail": "Placeholder 3D file not found on server."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = await sync_to_async(GeneratedModelSerializer)(
            generated, context={"request": request}
        )
        user_serializer = await sync_to_async(UserSerializer)(user)

        serialized_data = await sync_to_async(lambda: serializer.data)()
        serialized_user = await sync_to_async(lambda: user_serializer.data)()
        # Also return a direct URL convenience key
        file_url = request.build_absolute_uri(generated.model_file.url)

        return Response(
            {
                "detail": "3D model generated (placeholder).",
                "data": serialized_data,
                "file_url": file_url,
                "user": serialized_user,
            },
            status=status.HTTP_201_CREATED,
        )
    else:
        return Response(
            {"detail": "No model path received"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class AssetsView(APIView):
    """
    GET /api/assets/

    Returns the authenticated user's full generation history,
    ordered newest first.

    Response shape:
    {
        "total": <int>,
        "models": [
            {
                "id":          <int>,
                "status":      "pending" | "processing" | "completed" | "failed",
                "input_image": "<url>",
                "image_token": "<str>",
                "task_id":     "<str>",
                "model_file":  "<url>",
                "created_at":  "<ISO 8601>"
            },
            ...
        ]
    }
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = GeneratedModel.objects.filter(user=request.user).order_by("-created_at")
        serializer = GeneratedModelSerializer(
            qs,
            many=True,
            context={"request": request},  # enables absolute URLs for FileFields
        )
        return Response({"total": qs.count(), "models": serializer.data})
