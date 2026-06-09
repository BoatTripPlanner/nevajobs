import type { CategoriaOferta, ModalidadDeportiva, Oferta, Usuario } from "@/types";

export type MatchReasonKey =
  | "languagesFull"
  | "languagesPartial"
  | "languagesMissing"
  | "workPermitOk"
  | "workPermitMissing"
  | "categoryMatch"
  | "categoryMismatch"
  | "modalityMatch"
  | "stationMatch"
  | "immediateAvailability";

export interface MatchResult {
  score: number;
  isMatch: boolean;
  reasons: MatchReasonKey[];
}

const MATCH_THRESHOLD = 55;

const CATEGORY_KEYWORDS: Record<CategoriaOferta, string[]> = {
  hoteles: ["hotel", "reception", "hospitality", "f&b", "couple", "hosteler"],
  escuelas: ["instructor", "ski", "snowboard", "teacher", "coach", "monitor"],
  alquiler: ["rental", "tech", "shop", "alquiler", "tienda"],
  oficina: ["office", "admin", "management", "gestion", "oficina"],
};

function normalizeLang(code: string): string {
  return code.trim().toUpperCase();
}

function languageScore(
  required: string[],
  spoken: string[],
): { points: number; reason: MatchReasonKey } {
  if (required.length === 0) {
    return { points: 20, reason: "languagesFull" };
  }

  const req = required.map(normalizeLang);
  const have = spoken.map(normalizeLang);
  const matched = req.filter((lang) => have.includes(lang));

  if (matched.length === req.length) {
    return { points: 30, reason: "languagesFull" };
  }
  if (matched.length > 0) {
    return { points: 12, reason: "languagesPartial" };
  }
  return { points: 0, reason: "languagesMissing" };
}

function categoryMatchesRole(categoria: CategoriaOferta, rolBuscado: string): boolean {
  const role = rolBuscado.toLowerCase();
  return CATEGORY_KEYWORDS[categoria].some((keyword) => role.includes(keyword));
}

function modalityCompatible(
  required?: ModalidadDeportiva,
  candidate?: ModalidadDeportiva,
): boolean {
  if (!required) return true;
  if (!candidate) return false;
  if (required === "both") return true;
  if (candidate === "both") return true;
  return required === candidate;
}

export function computeMatch(oferta: Oferta, candidato: Usuario): MatchResult {
  const reasons: MatchReasonKey[] = [];
  let score = 0;

  const lang = languageScore(
    oferta.idiomas_requeridos.map(String),
    candidato.idiomas_hablados.map(String),
  );
  score += lang.points;
  reasons.push(lang.reason);

  if (oferta.zona_economica === "UE" || oferta.zona_economica === "Suiza") {
    if (candidato.permiso_trabajo_ue) {
      score += 20;
      reasons.push("workPermitOk");
    } else {
      reasons.push("workPermitMissing");
    }
  } else {
    score += 10;
    reasons.push("workPermitOk");
  }

  const role = candidato.rol_buscado ?? "";
  const categoryOk = categoryMatchesRole(oferta.categoria, role);

  if (categoryOk) {
    score += 25;
    reasons.push("categoryMatch");
  } else {
    reasons.push("categoryMismatch");
  }

  if (oferta.categoria === "escuelas" && oferta.modalidad) {
    if (modalityCompatible(oferta.modalidad, candidato.modalidad_principal)) {
      score += 15;
      reasons.push("modalityMatch");
    }
  }

  const station = candidato.estacion_actual?.toLowerCase() ?? "";
  const jobStation = oferta.estacion.toLowerCase();
  if (
    candidato.en_estacion
    && station
    && (station.includes(jobStation) || jobStation.includes(station))
  ) {
    score += 10;
    reasons.push("stationMatch");
  }

  if (candidato.disponibilidad_inmediata) {
    score += 10;
    reasons.push("immediateAvailability");
  }

  return {
    score: Math.min(100, score),
    isMatch: score >= MATCH_THRESHOLD && lang.reason !== "languagesMissing",
    reasons,
  };
}
