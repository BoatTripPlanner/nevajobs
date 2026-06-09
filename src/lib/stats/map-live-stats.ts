import type { LiveStats } from "@/types/job";

export function mapEstadisticasToLiveStats(data: {
  ofertas_activas: number;
  candidatos_disponibles: number;
  paises_top_contratacion: string[];
}): LiveStats {
  return {
    activeJobs: data.ofertas_activas,
    availableCandidates: data.candidatos_disponibles,
    topCountries: data.paises_top_contratacion,
  };
}
