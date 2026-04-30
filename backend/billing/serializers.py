from rest_framework import serializers
from billing.models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    credits_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            "plan",
            "status",
            "current_period_end",
            "credits_remaining",
        ]

    def get_credits_remaining(self, obj):
        return obj.user.credits  # pulls from your existing User model field
