import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  currentMonthKey,
  evaluateUnlock,
  getMonthlyUnlocksUsed,
} from "@/lib/billing/plan-access";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Usuario } from "@/types";

export type UnlockResult =
  | { ok: true; candidato: Usuario; alreadyUnlocked: boolean; usedCredit: boolean }
  | { ok: false; error: string; code: string };

export async function getUnlockedCandidateIds(empresaId: string): Promise<string[]> {
  const snap = await getAdminDb()
    .collection(COLLECTIONS.DESBLOQUEOS)
    .where("empresa_id", "==", empresaId)
    .get();

  return snap.docs.map((doc) => doc.data().candidato_id as string);
}

export async function unlockCandidateForEmpresa(
  empresaId: string,
  candidatoId: string,
  ofertaId?: string,
): Promise<UnlockResult> {
  const db = getAdminDb();

  const desbloqueoDocId = `${empresaId}_${candidatoId}`;

  const [empresaSnap, candidatoSnap, existingSnap] = await Promise.all([
    db.collection(COLLECTIONS.USUARIOS).doc(empresaId).get(),
    db.collection(COLLECTIONS.USUARIOS).doc(candidatoId).get(),
    db.collection(COLLECTIONS.DESBLOQUEOS).doc(desbloqueoDocId).get(),
  ]);

  if (!empresaSnap.exists) {
    return { ok: false, error: "Company profile not found.", code: "empresa_not_found" };
  }

  if (!candidatoSnap.exists) {
    return { ok: false, error: "Candidate not found.", code: "candidato_not_found" };
  }

  const empresa = { uid: empresaSnap.id, ...empresaSnap.data() } as Usuario;
  const candidato = { uid: candidatoSnap.id, ...candidatoSnap.data() } as Usuario;

  if (empresa.rol !== "empresa") {
    return { ok: false, error: "Only companies can unlock candidates.", code: "not_empresa" };
  }

  if (candidato.rol !== "candidato") {
    return { ok: false, error: "Invalid candidate.", code: "invalid_candidato" };
  }

  if (existingSnap.exists) {
    return {
      ok: true,
      candidato,
      alreadyUnlocked: true,
      usedCredit: Boolean(existingSnap.data()?.uso_credito),
    };
  }

  const evaluation = evaluateUnlock(empresa);
  if (!evaluation.allowed) {
    return {
      ok: false,
      error:
        evaluation.reason === "monthly_limit_reached"
          ? "Monthly unlock limit reached. Buy credits or upgrade your plan."
          : "Upgrade your plan or buy credits to unlock candidates.",
      code: evaluation.reason ?? "not_allowed",
    };
  }

  const monthKey = currentMonthKey();
  const empresaData = empresaSnap.data()!;
  const resetNeeded = empresaData.desbloqueos_mes_reset_mes !== monthKey;
  const currentUsed = resetNeeded ? 0 : getMonthlyUnlocksUsed(empresa);

  const empresaRef = db.collection(COLLECTIONS.USUARIOS).doc(empresaId);
  const batch = db.batch();

  if (evaluation.usesCredit) {
    if ((empresa.creditos_disponibles ?? 0) < 1) {
      return { ok: false, error: "No credits available.", code: "no_credits" };
    }
    batch.update(empresaRef, {
      creditos_disponibles: FieldValue.increment(-1),
      updated_at: FieldValue.serverTimestamp(),
    });
  } else {
    batch.update(empresaRef, {
      desbloqueos_mes_usados: currentUsed + 1,
      desbloqueos_mes_reset_mes: monthKey,
      updated_at: FieldValue.serverTimestamp(),
    });
  }

  const desbloqueoRef = db.collection(COLLECTIONS.DESBLOQUEOS).doc(desbloqueoDocId);
  batch.set(desbloqueoRef, {
    empresa_id: empresaId,
    candidato_id: candidatoId,
    ...(ofertaId ? { oferta_id: ofertaId } : {}),
    uso_credito: evaluation.usesCredit,
    fecha_desbloqueo: Timestamp.now(),
  });

  await batch.commit();

  return {
    ok: true,
    candidato,
    alreadyUnlocked: false,
    usedCredit: evaluation.usesCredit,
  };
}
