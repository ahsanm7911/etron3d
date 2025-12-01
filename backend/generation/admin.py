from django.contrib import admin
from .models import GeneratedModel, UploadedImage
# Register your models here.
admin.site.register((GeneratedModel, UploadedImage))