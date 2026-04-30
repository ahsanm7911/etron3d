# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_subscription(sender, instance, created, **kwargs):
    if created:
        from billing.models import Subscription

        Subscription.objects.get_or_create(user=instance)

        # Seed free credits if not already set
        if instance.credits == 0:
            instance.credits = settings.PLAN_CREDITS.get("free", 10)
            instance.save(update_fields=["credits"])
