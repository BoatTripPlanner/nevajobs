import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/types";

export async function setUserPremium(
  uid: string,
  isPremium: boolean,
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        es_premium: isPremium,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function syncStripeCustomer(
  uid: string,
  customerId: string,
  subscriptionId?: string,
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        stripe_customer_id: customerId,
        ...(subscriptionId ? { stripe_subscription_id: subscriptionId } : {}),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
