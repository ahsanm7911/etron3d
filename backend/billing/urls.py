from django.urls import path
from .views import (
    create_checkout_session,
    CheckoutSessionView,
    BillingPortalView,
    CancelSubscriptionView,
    SubscriptionStatusView,
    StripeWebhookView,
)

urlpatterns = [
    path("create-checkout/", create_checkout_session, name="stripe-checkout"),
    path("checkout/", CheckoutSessionView.as_view(), name="billing-checkout"),
    path("portal/", BillingPortalView.as_view(), name="billing-portal"),
    path("cancel/", CancelSubscriptionView.as_view(), name="billing-cancel"),
    path("status/", SubscriptionStatusView.as_view(), name="billing-status"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
