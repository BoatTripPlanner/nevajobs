import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { COLLECTIONS } from "@/types";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  if (!priceId) {
    return Response.json(
      { error: "STRIPE_PREMIUM_PRICE_ID is not configured." },
      { status: 500 },
    );
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
      { error: "Only company accounts can upgrade to Premium." },
      { status: 403 },
    );
  }

  if (user.es_premium) {
    return Response.json({ error: "Already on Premium." }, { status: 400 });
  }

  const appUrl = getAppUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing/cancel`,
    client_reference_id: uid,
    customer_email: user.email,
    metadata: { firebase_uid: uid },
    subscription_data: {
      metadata: { firebase_uid: uid },
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
