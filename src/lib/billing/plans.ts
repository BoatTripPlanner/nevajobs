/**
 * B2B pricing — temporada Nov–Mar, verano gratuito para empresas.
 * Los price IDs de Stripe se configuran en variables de entorno.
 */

import type { PlanEmpresa } from "@/types";

export type PlanId = "starter" | "pro" | "enterprise";
export type BillingPeriod = "monthly" | "season";

export const PLAN_LIMITS = {
  gratis: {
    desbloqueosMes: 0,
    emergencyRadar: false,
    couplesFilter: false,
    chat: false,
    featuredOffersPerMonth: 0,
    verifiedFilter: false,
    multiAccount: false,
    visaFilter: false,
    aiOfferGenerator: false,
    combinedHiring: false,
    videoIntro: false,
    antiFugasFilter: false,
    atsExport: false,
    mobileAlerts: false,
    brandedOffers: false,
  },
  starter: {
    desbloqueosMes: 15,
    emergencyRadar: false,
    couplesFilter: false,
    chat: true,
    featuredOffersPerMonth: 0,
    verifiedFilter: false,
    multiAccount: false,
    visaFilter: true,
    aiOfferGenerator: true,
    combinedHiring: false,
    videoIntro: false,
    antiFugasFilter: false,
    atsExport: false,
    mobileAlerts: false,
    brandedOffers: false,
  },
  pro: {
    desbloqueosMes: null as number | null,
    emergencyRadar: true,
    couplesFilter: true,
    chat: true,
    featuredOffersPerMonth: 0,
    verifiedFilter: false,
    multiAccount: false,
    visaFilter: true,
    aiOfferGenerator: true,
    combinedHiring: true,
    videoIntro: true,
    antiFugasFilter: true,
    atsExport: false,
    mobileAlerts: false,
    brandedOffers: false,
  },
  enterprise: {
    desbloqueosMes: null,
    emergencyRadar: true,
    couplesFilter: true,
    chat: true,
    featuredOffersPerMonth: 3,
    verifiedFilter: true,
    multiAccount: true,
    visaFilter: true,
    aiOfferGenerator: true,
    combinedHiring: true,
    videoIntro: true,
    antiFugasFilter: true,
    atsExport: true,
    mobileAlerts: true,
    brandedOffers: true,
  },
} as const;

export const CREDIT_PRICE_EUR = 5;

export const PLAN_PRICES = {
  starter: { monthly: 39, season: 175 },
  pro: { monthly: 79, season: 350 },
  enterprise: { monthly: 149, season: null },
} as const;

export const FEATURED_OFFER_PRICE_EUR = 29;

/** Noviembre: primer mes Pro gratis (campaña de lanzamiento). */
export function isLaunchPromoActive(): boolean {
  const month = new Date().getMonth(); // 0-indexed: 10 = November
  return month === 10;
}

export function isWinterSeason(): boolean {
  const month = new Date().getMonth();
  return month >= 10 || month <= 2; // Nov–Mar
}

export function getStripePriceId(
  plan: PlanId,
  period: BillingPeriod,
): string | undefined {
  const envMap: Record<string, string | undefined> = {
    "starter-monthly": process.env.STRIPE_PRICE_STARTER_MONTHLY,
    "starter-season": process.env.STRIPE_PRICE_STARTER_SEASON,
    "pro-monthly":
      process.env.STRIPE_PRICE_PRO_MONTHLY ?? process.env.STRIPE_PREMIUM_PRICE_ID,
    "pro-season": process.env.STRIPE_PRICE_PRO_SEASON,
    "enterprise-monthly": process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
  };
  return envMap[`${plan}-${period}`];
}

export function getCreditPriceId(): string | undefined {
  return process.env.STRIPE_PRICE_CREDIT;
}

export function planToEsPremium(plan: PlanEmpresa): boolean {
  return plan !== "gratis";
}

export function starterCreditsOnSubscribe(): number {
  return 0;
}
