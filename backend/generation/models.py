from django.db import models
from django.conf import settings
# Create your models here.


def upload_image_path(instance, filename):
    """
    Return the upload path for user-submitted images.

    Example:
        uploads/<user_id>/input/<filename>
    """
    return f"uploads/{instance.user.id}/input/{filename}"

class UploadedImage(models.Model):
    """
    Stores uploaded images from users before they are processed
    into 3D model generation jobs.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="uploaded_images"
    )
    image = models.ImageField(upload_to=upload_image_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id} uploaded by {self.user.email}"