from django.db import models
from django.conf import settings


class Plan(models.TextChoices):
    FREE = "free", "Free"
    PRO = "pro", "Pro"
    STUDIO = "studio", "Studio"
    ENTERPRISE = "enterprise", "Enterprise"


class SubscriptionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    CANCELLED = "cancelled", "Cancelled"
    PAST_DUE = "past_due", "Past Due"
    TRIALING = "trialing", "Trialing"


class Subscription(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.FREE)
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
    )
    stripe_customer_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True
    )
    stripe_subscription_id = models.CharField(
        max_length=255, blank=True, null=True, unique=True
    )
    current_period_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} — {self.plan} ({self.status})"

    @property
    def is_active(self):
        return self.status == SubscriptionStatus.ACTIVE
