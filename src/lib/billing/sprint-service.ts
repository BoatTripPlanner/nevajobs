import {
  EARLY_ACCESS_HOURS,
  getCurrentWinterSeason,
  SPRINT_DAYS,
} from "@/lib/billing/candidate-plans";
import type { Oferta, Usuario } from "@/types";
import type { Timestamp } from "firebase/firestore";

export type SprintStepId =
  | "basic"
  | "experience"
  | "cv"
  | "voice"
  | "video";

export type SprintStep = {
  id: SprintStepId;
  done: boolean;
};

function toDate(
  value: Timestamp | { seconds: number } | Date | string | undefined,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if ("toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if ("seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return null;
}

export function getSprintDeadline(profile: Usuario): Date {
  const explicit = toDate(profile.sprint_deadline_at);
  if (explicit) return explicit;

  const created = toDate(profile.created_at);
  const base = created ?? new Date();
  return new Date(base.getTime() + SPRINT_DAYS * 24 * 60 * 60 * 1000);
}

export function getSprintDaysRemaining(profile: Usuario): number {
  const ms = getSprintDeadline(profile).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function isSprintExpired(profile: Usuario): boolean {
  return Date.now() > getSprintDeadline(profile).getTime();
}

export function hasSkiPass(profile: Usuario): boolean {
  if (!profile.tiene_ski_pass) return false;
  const season = profile.ski_pass_temporada;
  if (!season) return true;
  return season === getCurrentWinterSeason();
}

export function hasProfileUnlock(profile: Usuario): boolean {
  return Boolean(profile.perfil_desbloqueado_pago || hasSkiPass(profile));
}

export function isSprintProfileComplete(profile: Usuario): boolean {
  return Boolean(
    profile.rol_buscado?.trim()
      && profile.idiomas_hablados?.length > 0
      && profile.pais_origen?.trim()
      && profile.titulacion?.trim()
      && (profile.url_cv || profile.cv_storage_path)
      && profile.url_audio_intro
      && profile.url_video_intro,
  );
}

export function hasFreeSprintReward(profile: Usuario): boolean {
  return Boolean(
    profile.badge_verified_speed
      || (isSprintProfileComplete(profile) && !isSprintExpired(profile)),
  );
}

/** Acceso a vídeo, audio y filtro parejas sin pagar. */
export function canUseAdvancedFeatures(profile: Usuario): boolean {
  if (profile.rol !== "candidato") return false;
  if (hasProfileUnlock(profile)) return true;
  if (profile.badge_verified_speed) return true;
  if (isSprintProfileComplete(profile) && !isSprintExpired(profile)) return true;
  return false;
}

export function isProfileLocked(profile: Usuario): boolean {
  if (profile.rol !== "candidato") return false;
  if (canUseAdvancedFeatures(profile)) return false;
  return isSprintExpired(profile) && !isSprintProfileComplete(profile);
}

export function canUseCvTranslator(profile: Usuario): boolean {
  return hasSkiPass(profile);
}

export function canUseEarlyAccess(profile: Usuario): boolean {
  return hasSkiPass(profile);
}

export function getSprintSteps(profile: Usuario): SprintStep[] {
  return [
    {
      id: "basic",
      done: Boolean(
        profile.rol_buscado?.trim()
          && profile.idiomas_hablados?.length > 0
          && profile.pais_origen?.trim(),
      ),
    },
    { id: "experience", done: Boolean(profile.titulacion?.trim()) },
    {
      id: "cv",
      done: Boolean(profile.url_cv || profile.cv_storage_path),
    },
    { id: "voice", done: Boolean(profile.url_audio_intro) },
    { id: "video", done: Boolean(profile.url_video_intro) },
  ];
}

export function getSprintProgress(profile: Usuario): {
  steps: SprintStep[];
  completed: number;
  total: number;
  percent: number;
} {
  const steps = getSprintSteps(profile);
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  return {
    steps,
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}

function publicationDate(oferta: Oferta): Date | null {
  return toDate(oferta.fecha_publicacion);
}

export function getEarlyAccessUnlockAt(oferta: Oferta): Date | null {
  if (!oferta.incluye_alojamiento) return null;
  const published = publicationDate(oferta);
  if (!published) return null;
  return new Date(
    published.getTime() + EARLY_ACCESS_HOURS * 60 * 60 * 1000,
  );
}

export function canApplyToOffer(
  profile: Usuario,
  oferta: Oferta,
): { allowed: boolean; reason?: "early_access"; unlocksAt?: Date } {
  if (!oferta.incluye_alojamiento) {
    return { allowed: true };
  }

  if (canUseEarlyAccess(profile)) {
    return { allowed: true };
  }

  const unlocksAt = getEarlyAccessUnlockAt(oferta);
  if (!unlocksAt) {
    return { allowed: true };
  }

  if (Date.now() >= unlocksAt.getTime()) {
    return { allowed: true };
  }

  return { allowed: false, reason: "early_access", unlocksAt };
}

export function shouldAwardVerifiedSpeed(profile: Usuario): boolean {
  return (
    !profile.badge_verified_speed
    && isSprintProfileComplete(profile)
    && !isSprintExpired(profile)
  );
}
