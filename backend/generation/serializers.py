from rest_framework import serializers
from .models import UploadedImage, GeneratedModel


class UploadedImageSerializer(serializers.ModelSerializer):
    """
    Serializer for validating and returning uploaded image data.
    Ensures only supported image formats are allowed.
    """

    class Meta:
        model = UploadedImage
        fields = ("id", "image", "uploaded_at")

    def validate_image(self, value):
        """
        Validate the file type and size.

        Allowed types: jpg, jpeg, png, webp.
        Max size: 10MB.
        """
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        max_size = 10 * 1024 * 1024  # 10MB

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Only JPG, PNG, and WEBP image formats are allowed."
            )

        if value.size > max_size:
            raise serializers.ValidationError("Image size cannot exceed 10MB.")

        return value


class GeneratedModelSerializer(serializers.ModelSerializer):
    """
    Serializer for GeneratedModel instances.

    The model_file is read-only because it is assigned on the server
    side to a placeholder 3D asset.
    """

    class Meta:
        model = GeneratedModel
        fields = [
            "id",
            "input_image",
            "image_token",
            "task_id",
            "model_file",
            "status",
            "created_at",
        ]
        read_only_fields = ["model_file", "status", "created_at"]

