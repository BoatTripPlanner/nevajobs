import Stripe from "stripe";
import type { PlanEmpresa } from "@/types";
import { getStripe } from "@/lib/stripe";
import {
  addCredits,
  setProfileUnlock,
  setSkiPass,
  setUserPlan,
  syncStripeCustomer,
} from "@/lib/stripe-premium";

export const runtime = "nodejs";

function parsePlan(value: string | undefined): PlanEmpresa {
  if (value === "starter" || value === "pro" || value === "enterprise") {
    return value;
  }
  return "pro";
}

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

        const checkoutType = session.metadata?.checkout_type;

        if (checkoutType === "credits") {
          const qty = Number(session.metadata?.credit_quantity ?? 1);
          await addCredits(uid, Number.isFinite(qty) && qty > 0 ? qty : 1);
        } else if (checkoutType === "ski_pass") {
          await setSkiPass(uid);
        } else if (checkoutType === "profile_unlock") {
          await setProfileUnlock(uid);
        } else {
          const plan = parsePlan(session.metadata?.plan);
          await setUserPlan(uid, plan, { resetMonthlyUsage: true });
        }

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

        if (active) {
          const plan = parsePlan(subscription.metadata?.plan);
          await setUserPlan(uid, plan);
        } else {
          await setUserPlan(uid, "gratis");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = subscription.metadata?.firebase_uid;
        if (!uid) break;

        await setUserPlan(uid, "gratis");
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
