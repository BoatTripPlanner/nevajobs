import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { CREDIT_REPLACEMENT_DAYS } from "@/lib/billing/product-guarantees";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/types";

export async function requestCreditRefund(
  empresaId: string,
  candidatoId: string,
  payload: {
    doc_alta_url: string;
    doc_baja_url: string;
    motivo: string;
  },
): Promise<{ ok: true; refunded: boolean } | { ok: false; error: string }> {
  const db = getAdminDb();
  const docId = `${empresaId}_${candidatoId}`;
  const desbloqueoRef = db.collection(COLLECTIONS.DESBLOQUEOS).doc(docId);
  const snap = await desbloqueoRef.get();

  if (!snap.exists) {
    return { ok: false, error: "Unlock not found." };
  }

  const data = snap.data()!;
  if (data.empresa_id !== empresaId) {
    return { ok: false, error: "Forbidden." };
  }
  if (!data.uso_credito) {
    return { ok: false, error: "Replacement guarantee applies only to credit unlocks." };
  }
  if (data.devolucion_estado === "aprobada") {
    return { ok: true, refunded: true };
  }

  const garantiaHasta = data.garantia_hasta?.toDate?.() as Date | undefined;
  if (!garantiaHasta || garantiaHasta < new Date()) {
    return {
      ok: false,
      error: `Guarantee window expired (${CREDIT_REPLACEMENT_DAYS} days).`,
    };
  }

  if (!payload.doc_alta_url?.trim() || !payload.doc_baja_url?.trim()) {
    return {
      ok: false,
      error: "Official alta and baja documents are required.",
    };
  }

  const batch = db.batch();
  const empresaRef = db.collection(COLLECTIONS.USUARIOS).doc(empresaId);

  batch.update(desbloqueoRef, {
    devolucion_estado: "aprobada",
    doc_alta_url: payload.doc_alta_url.trim(),
    doc_baja_url: payload.doc_baja_url.trim(),
    devolucion_motivo: payload.motivo.trim(),
    devolucion_aprobada_en: Timestamp.now(),
  });

  batch.update(empresaRef, {
    creditos_disponibles: FieldValue.increment(1),
    updated_at: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return { ok: true, refunded: true };
}
