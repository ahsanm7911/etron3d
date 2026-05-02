import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from users.serializers import User, UserSerializer
from . import services
from .webhooks import handle_webhook
from .models import Subscription
from .serializers import SubscriptionSerializer
from pprint import pprint

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Creates a Stripe Checkout session for subscription purchase.
    Frontend must send a price_id.
    """
    price_id = request.data.get("price_id")

    if not price_id:
        return Response({"error": "price_id required"}, status=400)

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,
        )
        return Response({"url": session.url})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


class CheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_key = request.data.get("plan")
        print(f"PLAN KEY: {plan_key}")
        if plan_key not in settings.STRIPE_PRICE_IDS:
            return Response(
                {"error": f"Invalid plan: {plan_key}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            url = services.create_checkout_session(request.user, plan_key)
            return Response({"checkout_url": url})
        except Exception as e:
            print(f"ERROR IN CHECKOUT: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BillingPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            url = services.create_billing_portal_session(request.user)
            return Response({"portal_url": url})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            services.cancel_subscription(request.user)
            return Response({"status": "Subscription will cancel at period end."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    """
    Must be csrf_exempt — Stripe POSTs here without a Django CSRF token.
    Do NOT add IsAuthenticated here.
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        print("WEBHOOK RECEIVED")
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        data, http_status = handle_webhook(payload, sig_header)
        return Response(data, status=http_status)
