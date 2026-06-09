import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Oferta } from "@/types";
import type { Job } from "@/types/job";
import { ofertaToJob } from "@/lib/data/ofertas";

export async function getActiveOfertas(max = 50): Promise<Job[]> {
  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.OFERTAS)
      .where("activa", "==", true)
      .limit(max)
      .get();

    const jobs = snap.docs.map((doc) =>
      ofertaToJob({ id: doc.id, ...doc.data() } as Oferta),
    );

    return jobs.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error("[getActiveOfertas]", error);
    return [];
  }
}

export async function getOfertaById(id: string): Promise<Oferta | null> {
  try {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.OFERTAS)
      .doc(id)
      .get();

    if (!snap.exists) return null;

    const oferta = { id: snap.id, ...snap.data() } as Oferta;
    return oferta.activa ? oferta : null;
  } catch (error) {
    console.error("[getOfertaById]", error);
    return null;
  }
}
