import { PLAN_LIMITS } from "@/lib/billing/plans";
import type { PlanEmpresa, Usuario } from "@/types";

export type UnlockBlockReason =
  | "no_plan_or_credits"
  | "monthly_limit_reached"
  | "not_empresa";

export function getEffectivePlan(profile: Usuario | null): PlanEmpresa {
  if (!profile || profile.rol !== "empresa") return "gratis";
  if (profile.plan_empresa) return profile.plan_empresa;
  if (profile.es_premium) return "pro";
  return "gratis";
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthlyUnlocksUsed(profile: Usuario): number {
  const key = profile.desbloqueos_mes_reset_mes;
  if (key !== currentMonthKey()) return 0;
  return profile.desbloqueos_mes_usados ?? 0;
}

export function getMonthlyUnlocksRemaining(profile: Usuario): number | null {
  const plan = getEffectivePlan(profile);
  const limit = PLAN_LIMITS[plan].desbloqueosMes;
  if (limit === null) return null;
  return Math.max(0, limit - getMonthlyUnlocksUsed(profile));
}

export function canAccessEmergencyRadar(profile: Usuario | null): boolean {
  const plan = getEffectivePlan(profile);
  return PLAN_LIMITS[plan].emergencyRadar;
}

export function canUseCouplesFilter(profile: Usuario | null): boolean {
  const plan = getEffectivePlan(profile);
  return PLAN_LIMITS[plan].couplesFilter;
}

export function canUseVerifiedFilter(profile: Usuario | null): boolean {
  const plan = getEffectivePlan(profile);
  return PLAN_LIMITS[plan].verifiedFilter;
}

export function canUseChat(profile: Usuario | null): boolean {
  const plan = getEffectivePlan(profile);
  return PLAN_LIMITS[plan].chat || (profile?.creditos_disponibles ?? 0) > 0;
}

export function evaluateUnlock(profile: Usuario): {
  allowed: boolean;
  usesCredit: boolean;
  reason?: UnlockBlockReason;
} {
  if (profile.rol !== "empresa") {
    return { allowed: false, usesCredit: false, reason: "not_empresa" };
  }

  const plan = getEffectivePlan(profile);
  const limits = PLAN_LIMITS[plan];
  const credits = profile.creditos_disponibles ?? 0;

  if (limits.desbloqueosMes === null) {
    return { allowed: true, usesCredit: false };
  }

  const remaining = getMonthlyUnlocksRemaining(profile);
  if (remaining !== null && remaining > 0) {
    return { allowed: true, usesCredit: false };
  }

  if (credits > 0) {
    return { allowed: true, usesCredit: true };
  }

  if (plan === "gratis") {
    return { allowed: false, usesCredit: false, reason: "no_plan_or_credits" };
  }

  return { allowed: false, usesCredit: false, reason: "monthly_limit_reached" };
}

export function isCoupleCandidate(candidato: Usuario): boolean {
  const role = (candidato.rol_buscado ?? "").toLowerCase();
  return role.includes("couple") || role.includes("pareja");
}

export function isEmergencyCandidate(candidato: Usuario): boolean {
  return candidato.disponibilidad_inmediata && Boolean(candidato.en_estacion);
}

export function canUseVisaFilter(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].visaFilter;
}

export function canUseAiOfferGenerator(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].aiOfferGenerator;
}

export function canUseCombinedHiring(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].combinedHiring;
}

export function canUseAntiFugasFilter(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].antiFugasFilter;
}

export function canExportAts(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].atsExport;
}

export function canUseBrandedOffers(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].brandedOffers;
}

export function canUseMobileAlerts(profile: Usuario | null): boolean {
  return PLAN_LIMITS[getEffectivePlan(profile)].mobileAlerts;
}

export function getReliabilityTier(
  temporadas: number | undefined,
): "new" | "reliable" | "veteran" {
  const n = temporadas ?? 0;
  if (n >= 3) return "veteran";
  if (n >= 1) return "reliable";
  return "new";
}
