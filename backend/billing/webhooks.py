import stripe
from django.conf import settings
from billing.services import activate_subscription, refresh_credits_on_renewal
from billing.models import Subscription


def handle_webhook(payload, sig_header):
    """
    Verifies and dispatches Stripe webhook events.
    Returns (response_data, http_status).
    """
    print("handle_webhook called.")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return {"error": "Invalid payload"}, 400
    except stripe.error.SignatureVerificationError:
        return {"error": "Invalid signature"}, 400

    print("Passed the try_except block")
    event_type = event["type"]
    print(f"EVENT TYPE: {event_type}")
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data)

    if event_type == "invoice.payment_succeeded":
        print("Calling invoice_payment_succeeded handler")

    elif event_type == "invoice.paid":
        print("Calling invoice_paid handler")
        _handle_invoice_paid(data)

    elif event_type == "invoice.payment_failed":
        print("Calling payment_failed handler")
        _handle_payment_failed(data)

    elif event_type == "customer.subscription.deleted":
        print("Calling subscription deleted handler")
        _handle_subscription_deleted(data)

    return {"status": "ok"}, 200


# ── Private handlers ──────────────────────────────────────────────────────────


def _handle_checkout_completed(session):
    print("Calling handle_checkout_completed")
    user_id = session["metadata"].get("user_id")
    plan_key = session["metadata"].get("plan")
    sub_id = session.get("subscription")

    if not all([user_id, plan_key, sub_id]):
        return

    # Fetch the full subscription object to get period end
    stripe_sub = stripe.Subscription.retrieve(sub_id)

    period_end = stripe_sub["items"]["data"][0]["current_period_end"]

    activate_subscription(user_id, plan_key, sub_id, period_end)


def _handle_invoice_paid(invoice):
    print("Calling invoice_paid")
    sub_id = invoice.get("subscription")
    if sub_id:
        refresh_credits_on_renewal(sub_id)


def _handle_payment_failed(invoice):
    sub_id = invoice.get("subscription")
    if not sub_id:
        return
    Subscription.objects.filter(stripe_subscription_id=sub_id).update(status="past_due")


def _handle_subscription_deleted(stripe_sub):
    sub_id = stripe_sub.get("id")
    if not sub_id:
        return

    sub = (
        Subscription.objects.filter(stripe_subscription_id=sub_id)
        .select_related("user")
        .first()
    )

    if not sub:
        return

    sub.plan = "free"
    sub.status = "active"
    sub.stripe_subscription_id = None
    sub.save()

    # Reset to free credits
    from django.conf import settings

    sub.user.credits = settings.PLAN_CREDITS.get("free", 0)
    sub.user.save(update_fields=["credits"])
