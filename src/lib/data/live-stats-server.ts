import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/types";
import { mapEstadisticasToLiveStats } from "@/lib/stats/map-live-stats";
import { recalculateLiveStats } from "@/lib/stats/recalculate-live-stats";
import { getLiveStats } from "@/lib/data/live-stats";
import type { LiveStats } from "@/types/job";

const STATS_DOC_ID = "global";

export async function refreshLiveStats(): Promise<LiveStats> {
  return recalculateLiveStats();
}

/** Refresh if stats doc is missing or older than maxAgeMinutes. */
export async function getLiveStatsFresh(maxAgeMinutes = 15): Promise<LiveStats> {
  try {
    const adminDb = getAdminDb();
    const snap = await adminDb
      .collection(COLLECTIONS.ESTADISTICAS_EN_VIVO)
      .doc(STATS_DOC_ID)
      .get();

    if (!snap.exists) {
      return refreshLiveStats();
    }

    const data = snap.data()!;
    const updatedAt = data.actualizado_en?.toDate?.();
    const stale =
      !updatedAt ||
      Date.now() - updatedAt.getTime() > maxAgeMinutes * 60 * 1000;

    if (stale) {
      return refreshLiveStats();
    }

    return mapEstadisticasToLiveStats(data as {
      ofertas_activas: number;
      candidatos_disponibles: number;
      paises_top_contratacion: string[];
    });
  } catch (error) {
    console.error("[getLiveStatsFresh]", error);
    return getLiveStats();
  }
}
