from django.urls import path
from .views import create_checkout_session

urlpatterns = [
    path("create-checkout/", create_checkout_session, name="stripe-checkout"),
]
