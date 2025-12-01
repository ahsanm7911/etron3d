from django.urls import path
from . import views

urlpatterns = [
    path("test/", views.test_endpoint),
    path("register/", views.register_view),
    path("login/", views.login_view),
    path("logout/", views.logout_view),
    path("google/", views.google_login_view),

    path("profile/", views.profile_view),
    path("profile/change-password/", views.change_password_view),

    

    path("password-reset/request/", views.request_password_reset_view),
    path("password-reset/confirm/", views.reset_password_view),
]
