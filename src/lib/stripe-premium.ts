import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getCurrentWinterSeason } from "@/lib/billing/candidate-plans";
import { planToEsPremium } from "@/lib/billing/plans";
import { notifyTopCandidateIfEligible } from "@/lib/email/top-candidate-alerts";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type PlanEmpresa } from "@/types";

export async function setUserPlan(
  uid: string,
  plan: PlanEmpresa,
  options?: { resetMonthlyUsage?: boolean },
): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        plan_empresa: plan,
        es_premium: planToEsPremium(plan),
        ...(options?.resetMonthlyUsage
          ? {
              desbloqueos_mes_usados: 0,
              ofertas_destacadas_mes_usadas: 0,
            }
          : {}),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

/** @deprecated Use setUserPlan */
export async function setUserPremium(
  uid: string,
  isPremium: boolean,
): Promise<void> {
  await setUserPlan(uid, isPremium ? "pro" : "gratis");
}

export async function addCredits(uid: string, amount: number): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        creditos_disponibles: FieldValue.increment(amount),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function setProfileUnlock(uid: string): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        perfil_desbloqueado_pago: true,
        perfil_desbloqueado_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function setSkiPass(uid: string): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        tiene_ski_pass: true,
        ski_pass_temporada: getCurrentWinterSeason(),
        ski_pass_comprado_at: FieldValue.serverTimestamp(),
        perfil_desbloqueado_pago: true,
        perfil_desbloqueado_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  void notifyTopCandidateIfEligible(uid);
}

export async function awardVerifiedSpeedBadge(uid: string): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        badge_verified_speed: true,
        sprint_completado_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  void notifyTopCandidateIfEligible(uid);
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
