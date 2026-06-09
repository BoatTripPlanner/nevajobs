import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS } from "@/types";
import { liveStats as fallbackStats } from "./home-data";
import type { LiveStats } from "@/types/job";
import { mapEstadisticasToLiveStats } from "@/lib/stats/map-live-stats";

const STATS_DOC_ID = "global";

/** Public read via client SDK (ISR cache on page). */
export async function getLiveStats(): Promise<LiveStats> {
  try {
    const snap = await getDoc(
      doc(db, COLLECTIONS.ESTADISTICAS_EN_VIVO, STATS_DOC_ID),
    );

    if (!snap.exists()) {
      return fallbackStats;
    }

    return mapEstadisticasToLiveStats(snap.data() as {
      ofertas_activas: number;
      candidatos_disponibles: number;
      paises_top_contratacion: string[];
    });
  } catch (error) {
    console.error("[getLiveStats]", error);
    return fallbackStats;
  }
}
