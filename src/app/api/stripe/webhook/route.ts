import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  setUserPremium,
  syncStripeCustomer,
} from "@/lib/stripe-premium";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("[stripe/webhook] signature verification failed", error);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid =
          session.metadata?.firebase_uid ?? session.client_reference_id;
        if (!uid) break;

        await setUserPremium(uid, true);

        if (session.customer && typeof session.customer === "string") {
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : undefined;
          await syncStripeCustomer(uid, session.customer, subscriptionId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebase_uid;
        if (!uid) break;

        const active =
          subscription.status === "active" ||
          subscription.status === "trialing";
        await setUserPremium(uid, active);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebase_uid;
        if (!uid) break;

        await setUserPremium(uid, false);
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[stripe/webhook] handler error", error);
    return Response.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return Response.json({ received: true });
}
