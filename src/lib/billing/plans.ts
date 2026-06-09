/**
 * B2B pricing — temporada Nov–Mar, verano gratuito para empresas.
 * Los price IDs de Stripe se configuran en variables de entorno.
 */

import type { BillingCurrency } from "@/lib/billing/currency";
import { getPlanPrices, PLAN_PRICES_BY_CURRENCY } from "@/lib/billing/currency";
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
    emailAlerts: false,
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
    emailAlerts: false,
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
    emailAlerts: false,
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
    emailAlerts: true,
    brandedOffers: true,
  },
} as const;

/** @deprecated Use getPlanPrices(currency) */
export const CREDIT_PRICE_EUR = PLAN_PRICES_BY_CURRENCY.EUR.credit;

/** @deprecated Use getPlanPrices(currency) */
export const PLAN_PRICES = PLAN_PRICES_BY_CURRENCY.EUR;

/** @deprecated Use getPlanPrices(currency) */
export const FEATURED_OFFER_PRICE_EUR = PLAN_PRICES_BY_CURRENCY.EUR.featuredOffer;

export { getPlanPrices, PLAN_PRICES_BY_CURRENCY };

/** Noviembre: primer mes Pro gratis (campaña de lanzamiento). */
export function isLaunchPromoActive(): boolean {
  const month = new Date().getMonth(); // 0-indexed: 10 = November
  return month === 10;
}

export function isWinterSeason(): boolean {
  const month = new Date().getMonth();
  return month >= 10 || month <= 2; // Nov–Mar
}

function priceEnvSuffix(currency: BillingCurrency): string {
  return currency === "CHF" ? "_CHF" : "";
}

export function getStripePriceId(
  plan: PlanId,
  period: BillingPeriod,
  currency: BillingCurrency = "EUR",
): string | undefined {
  const suffix = priceEnvSuffix(currency);
  const envMap: Record<string, string | undefined> = {
    "starter-monthly": process.env[`STRIPE_PRICE_STARTER_MONTHLY${suffix}`],
    "starter-season": process.env[`STRIPE_PRICE_STARTER_SEASON${suffix}`],
    "pro-monthly":
      process.env[`STRIPE_PRICE_PRO_MONTHLY${suffix}`]
      ?? (currency === "EUR" ? process.env.STRIPE_PREMIUM_PRICE_ID : undefined),
    "pro-season": process.env[`STRIPE_PRICE_PRO_SEASON${suffix}`],
    "enterprise-monthly": process.env[`STRIPE_PRICE_ENTERPRISE_MONTHLY${suffix}`],
  };
  return envMap[`${plan}-${period}`];
}

export function getCreditPriceId(currency: BillingCurrency = "EUR"): string | undefined {
  const suffix = priceEnvSuffix(currency);
  return process.env[`STRIPE_PRICE_CREDIT${suffix}`];
}

export function planToEsPremium(plan: PlanEmpresa): boolean {
  return plan !== "gratis";
}

export function starterCreditsOnSubscribe(): number {
  return 0;
}
