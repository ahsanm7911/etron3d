import stripe
from django.conf import settings
from django.utils import timezone
from datetime import datetime

stripe.api_key = settings.STRIPE_SECRET_KEY


def get_or_create_stripe_customer(user, subscription):
    """
    Returns existing Stripe customer or creates a new one.
    Saves the customer ID back to the Subscription model.
    """
    if subscription.stripe_customer_id:
        return stripe.Customer.retrieve(subscription.stripe_customer_id)

    customer = stripe.Customer.create(
        email=user.email,
        name=f"{user.first_name} {user.last_name}".strip() or user.email,
        metadata={"user_id": str(user.id)},
    )
    subscription.stripe_customer_id = customer.id
    subscription.save(update_fields=["stripe_customer_id"])
    return customer


def create_checkout_session(user, plan_key):
    """
    Creates a Stripe Checkout Session for the given plan.
    Returns the session URL to redirect the user to.
    """
    print("Calling create_checkout_session")
    # subscription, _ = (
    #     user.subscription if hasattr(user, "subscription") else (None, None)
    # )
    # Fetch or create subscription row
    from .models import Subscription

    subscription, _ = Subscription.objects.get_or_create(user=user)
    price_id = settings.STRIPE_PRICE_IDS.get(plan_key)
    if not price_id:
        raise ValueError(f"No price ID configured for plan: {plan_key}")

    customer = get_or_create_stripe_customer(user, subscription)

    session = stripe.checkout.Session.create(
        customer=customer.id,
        payment_method_types=["card"],
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{settings.FRONTEND_URL}/dashboard?payment=success&plan={plan_key}",
        cancel_url=f"{settings.FRONTEND_URL}/pricing?payment=cancelled",
        metadata={
            "user_id": str(user.id),
            "plan": plan_key,
        },
        subscription_data={
            "metadata": {
                "user_id": str(user.id),
                "plan": plan_key,
            }
        },
    )
    return session.url


def create_billing_portal_session(user):
    """
    Creates a Stripe Customer Portal session.
    Lets the user manage cards, invoices, and cancel — all hosted by Stripe.
    """
    from billing.models import Subscription

    subscription = Subscription.objects.get(user=user)

    if not subscription.stripe_customer_id:
        raise ValueError("No Stripe customer found for this user.")

    session = stripe.billing_portal.Session.create(
        customer=subscription.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/dashboard",
    )
    return session.url


def cancel_subscription(user):
    """
    Cancels the Stripe subscription at period end (not immediately).
    """
    from billing.models import Subscription

    subscription = Subscription.objects.get(user=user)

    if not subscription.stripe_subscription_id:
        raise ValueError("No active Stripe subscription found.")

    stripe.Subscription.modify(
        subscription.stripe_subscription_id,
        cancel_at_period_end=True,
    )
    subscription.status = "cancelled"
    subscription.save(update_fields=["status"])


def activate_subscription(
    user_id, plan_key, stripe_subscription_id, current_period_end_ts
):
    """
    Called by the webhook handler after a successful checkout.
    Updates the DB and refreshes the user's credits.
    """
    from billing.models import Subscription
    from django.contrib.auth import get_user_model

    User = get_user_model()

    user = User.objects.get(id=user_id)
    subscription = Subscription.objects.get(user=user)

    subscription.plan = plan_key
    subscription.status = "active"
    subscription.stripe_subscription_id = stripe_subscription_id
    subscription.current_period_end = datetime.fromtimestamp(
        current_period_end_ts, tz=timezone.utc
    )
    subscription.save()

    # Refresh the user's credits to the new plan's quota
    credits = settings.PLAN_CREDITS.get(plan_key, 0)
    user.credits = credits  # assumes `credits` field on your User model
    user.save(update_fields=["credits"])


def refresh_credits_on_renewal(stripe_subscription_id):
    """
    Called by the webhook on invoice.paid (monthly renewal).
    Tops up credits back to the plan quota.
    """
    from billing.models import Subscription

    subscription = (
        Subscription.objects.filter(stripe_subscription_id=stripe_subscription_id)
        .select_related("user")
        .first()
    )

    if not subscription:
        return

    credits = settings.PLAN_CREDITS.get(subscription.plan, 0)
    subscription.user.credits = credits
    subscription.user.save(update_fields=["credits"])
