import {
  getProfileUnlockAmount,
  getProfileUnlockPriceId,
  getSkiPassAmount,
  getSkiPassPriceId,
} from "@/lib/billing/candidate-plans";
import {
  getCreditPriceId,
  getStripePriceId,
  isLaunchPromoActive,
  type BillingPeriod,
  type PlanId,
} from "@/lib/billing/plans";
import { getUserBillingCurrency } from "@/lib/billing/currency";
import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { COLLECTIONS, type Usuario } from "@/types";

type CheckoutBody =
  | { type: "subscription"; plan: PlanId; period: BillingPeriod }
  | { type: "credits"; quantity: number }
  | { type: "ski_pass" }
  | { type: "profile_unlock" };

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

  const user = { uid: userSnap.id, ...userSnap.data() } as Usuario;
  const currency = getUserBillingCurrency(user);
  const appUrl = getAppUrl();
  const stripe = getStripe();

  if (body.type === "ski_pass" || body.type === "profile_unlock") {
    if (user.rol !== "candidato") {
      return Response.json(
        { error: "Only candidate accounts can purchase Ski Pass." },
        { status: 403 },
      );
    }

    const isSkiPass = body.type === "ski_pass";
    const priceId = isSkiPass
      ? getSkiPassPriceId(currency)
      : getProfileUnlockPriceId(currency);

    if (!priceId) {
      return Response.json(
        {
          error: isSkiPass
            ? `STRIPE_PRICE_SKI_PASS${currency === "CHF" ? "_CHF" : ""} is not configured.`
            : `STRIPE_PRICE_PROFILE_UNLOCK${currency === "CHF" ? "_CHF" : ""} is not configured.`,
        },
        { status: 500 },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}&product=${body.type}`,
      cancel_url: `${appUrl}/billing/cancel`,
      client_reference_id: uid,
      customer_email: user.email,
      metadata: {
        firebase_uid: uid,
        checkout_type: body.type,
        currency,
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Failed to create checkout session." },
        { status: 500 },
      );
    }

    return Response.json({
      url: session.url,
      currency,
      amount: isSkiPass ? getSkiPassAmount(currency) : getProfileUnlockAmount(currency),
    });
  }

  if (user.rol !== "empresa") {
    return Response.json(
      { error: "Only company accounts can purchase plans." },
      { status: 403 },
    );
  }

  if (body.type === "credits") {
    const quantity = Math.min(Math.max(Math.floor(body.quantity), 1), 50);
    const priceId = getCreditPriceId(currency);

    if (!priceId) {
      return Response.json(
        {
          error: `STRIPE_PRICE_CREDIT${currency === "CHF" ? "_CHF" : ""} is not configured.`,
        },
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
        currency,
      },
    });

    if (!session.url) {
      return Response.json(
        { error: "Failed to create checkout session." },
        { status: 500 },
      );
    }

    return Response.json({ url: session.url, currency });
  }

  const { plan, period } = body;
  if (!plan || !period) {
    return Response.json({ error: "Missing plan or period." }, { status: 400 });
  }

  const priceId = getStripePriceId(plan, period, currency);
  if (!priceId) {
    return Response.json(
      {
        error: `Stripe price not configured for ${plan} (${period}, ${currency}).`,
      },
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
      currency,
    },
    ...(isSubscription
      ? {
          subscription_data: {
            metadata: { firebase_uid: uid, plan, period, currency },
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

  return Response.json({ url: session.url, currency });
}
