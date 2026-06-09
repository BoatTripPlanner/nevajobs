import {
  getCreditPriceId,
  getStripePriceId,
  isLaunchPromoActive,
  type BillingPeriod,
  type PlanId,
} from "@/lib/billing/plans";
import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { COLLECTIONS } from "@/types";

type CheckoutBody =
  | { type: "subscription"; plan: PlanId; period: BillingPeriod }
  | { type: "credits"; quantity: number };

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const userSnap = await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .get();

  if (!userSnap.exists) {
    return Response.json({ error: "User profile not found." }, { status: 404 });
  }

  const user = userSnap.data()!;
  if (user.rol !== "empresa") {
    return Response.json(
      { error: "Only company accounts can purchase plans." },
      { status: 403 },
    );
  }

  const appUrl = getAppUrl();
  const stripe = getStripe();

  if (body.type === "credits") {
    const quantity = Math.min(Math.max(Math.floor(body.quantity), 1), 50);
    const priceId = getCreditPriceId();

    if (!priceId) {
      return Response.json(
        { error: "STRIPE_PRICE_CREDIT is not configured." },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      client_reference_id: uid,
      customer_email: user.email,
      metadata: {
        firebase_uid: uid,
        checkout_type: "credits",
        credit_quantity: String(quantity),
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Failed to create checkout session." },
        { status: 500 },
      );
    }

    return Response.json({ url: session.url });
  }

  const { plan, period } = body;
  if (!plan || !period) {
    return Response.json({ error: "Missing plan or period." }, { status: 400 });
  }

  const priceId = getStripePriceId(plan, period);
  if (!priceId) {
    return Response.json(
      { error: `Stripe price not configured for ${plan} (${period}).` },
      { status: 500 },
    );
  }

  const isSubscription = period === "monthly";
  const trialDays =
    plan === "pro" && period === "monthly" && isLaunchPromoActive() ? 30 : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing/cancel`,
    client_reference_id: uid,
    customer_email: user.email,
    metadata: {
      firebase_uid: uid,
      checkout_type: "subscription",
      plan,
      period,
    },
    ...(isSubscription
      ? {
          subscription_data: {
            metadata: { firebase_uid: uid, plan, period },
            ...(trialDays ? { trial_period_days: trialDays } : {}),
          },
        }
      : {}),
  });

  if (!session.url) {
    return Response.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }

  return Response.json({ url: session.url });
}
