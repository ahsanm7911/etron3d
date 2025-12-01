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
    
class GeneratedModel(models.Model):
    """
    Stores a single 3D generation job.

    For now:
    - input_image: the original image uploaded by the user.
    - model_file: a placeholder 3D file (e.g. a static .glb placed in MEDIA_ROOT).
    - status: simple status field ("completed" for placeholder).
    """
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed")
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generated_models"
    )
    input_image = models.ImageField(upload_to="input_images/")
    model_file = models.FileField(upload_to="models/", blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"GeneratedModel #{self.pk} for {self.user.email.split('@')[0]}"