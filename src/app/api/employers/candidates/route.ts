import { getUnlockedCandidateIds } from "@/lib/billing/unlock-candidate-server";
import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { sanitizeCandidatoForEmployer } from "@/lib/privacy/sanitize-candidato";
import { getAdminDb } from "@/lib/firebase-admin";
import { isProfileComplete } from "@/lib/profile/profile-service";
import { COLLECTIONS, type Usuario } from "@/types";

export async function GET(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const empresaSnap = await db.collection(COLLECTIONS.USUARIOS).doc(uid).get();
  if (!empresaSnap.exists || empresaSnap.data()?.rol !== "empresa") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [candidatosSnap, unlockedIds] = await Promise.all([
    db.collection(COLLECTIONS.USUARIOS).where("rol", "==", "candidato").get(),
    getUnlockedCandidateIds(uid),
  ]);

  const unlockedSet = new Set(unlockedIds);
  const candidatos = candidatosSnap.docs
    .map((doc) => ({ uid: doc.id, ...doc.data() }) as Usuario)
    .filter((u) => u.perfil_completo === true || isProfileComplete(u))
    .map((c) => sanitizeCandidatoForEmployer(c, unlockedSet.has(c.uid)));

  return Response.json({ candidatos });
}
