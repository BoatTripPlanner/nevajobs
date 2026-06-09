import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/types";

export async function adminDeleteOferta(ofertaId: string): Promise<void> {
  const db = getAdminDb();
  const ofertaRef = db.collection(COLLECTIONS.OFERTAS).doc(ofertaId);
  const ofertaSnap = await ofertaRef.get();
  if (!ofertaSnap.exists) {
    throw new Error("Oferta not found");
  }

  const postulacionesSnap = await db
    .collection(COLLECTIONS.POSTULACIONES)
    .where("oferta_id", "==", ofertaId)
    .get();

  const batch = db.batch();
  for (const doc of postulacionesSnap.docs) {
    batch.delete(doc.ref);
  }
  batch.delete(ofertaRef);
  await batch.commit();
}

export async function adminSetOfertaActiva(
  ofertaId: string,
  activa: boolean,
): Promise<void> {
  const db = getAdminDb();
  const ofertaRef = db.collection(COLLECTIONS.OFERTAS).doc(ofertaId);
  const ofertaSnap = await ofertaRef.get();
  if (!ofertaSnap.exists) {
    throw new Error("Oferta not found");
  }

  await ofertaRef.update({
    activa,
    updated_at: new Date(),
  });
}
