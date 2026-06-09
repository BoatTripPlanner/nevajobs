import "server-only";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/types";
import type { LiveStats } from "@/types/job";

const STATS_DOC_ID = "global";

function topCountriesFromOfertas(
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
): string[] {
  const counts = new Map<string, number>();

  for (const doc of docs) {
    const pais = doc.data().pais as string;
    if (!pais) continue;
    counts.set(pais, (counts.get(pais) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pais]) => pais);
}

/** Recalculates and persists estadisticas_en_vivo/global from real collections. */
export async function recalculateLiveStats(): Promise<LiveStats> {
  const db = getAdminDb();

  const [ofertasSnap, candidatosSnap] = await Promise.all([
    db.collection(COLLECTIONS.OFERTAS).where("activa", "==", true).get(),
    // Single-field query avoids composite index requirement in production
    db.collection(COLLECTIONS.USUARIOS).where("rol", "==", "candidato").get(),
  ]);

  const availableCandidates = candidatosSnap.docs.filter(
    (doc) => doc.data().disponibilidad_inmediata === true,
  ).length;

  const stats = {
    id: STATS_DOC_ID,
    ofertas_activas: ofertasSnap.size,
    candidatos_disponibles: availableCandidates,
    paises_top_contratacion: topCountriesFromOfertas(ofertasSnap.docs),
    actualizado_en: Timestamp.now(),
  };

  await db
    .collection(COLLECTIONS.ESTADISTICAS_EN_VIVO)
    .doc(STATS_DOC_ID)
    .set(stats, { merge: true });

  return {
    activeJobs: stats.ofertas_activas,
    availableCandidates: stats.candidatos_disponibles,
    topCountries: stats.paises_top_contratacion,
  };
}
