from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .serializers import UploadedImageSerializer
# Create your views here.

@api_view(['POST'])
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

