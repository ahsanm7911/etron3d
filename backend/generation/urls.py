from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.upload_image_view),
    path("image-to-3d/", views.image_to_3d_placeholder_view),
    path("assets/", views.AssetsView.as_view()),
]
