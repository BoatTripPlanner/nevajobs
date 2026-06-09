/**
 * Candidato — Sprint de 15 días + Ski Pass (pago único por temporada).
 */

import type { BillingCurrency } from "@/lib/billing/currency";
import { getCandidatePrices } from "@/lib/billing/currency";

export const SPRINT_DAYS = 15;
export const EARLY_ACCESS_HOURS = 48;

/** @deprecated Use getCandidatePrices(currency) */
export const PROFILE_UNLOCK_PRICE_EUR = 2.99;
/** @deprecated Use getCandidatePrices(currency) */
export const SKI_PASS_PRICE_EUR = 4.99;

export function getCurrentWinterSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Temporada Nov–Mar: si estamos en ene–mar, temporada empezó el año anterior
  const startYear = month <= 2 ? year - 1 : year;
  return `${startYear}-${startYear + 1}`;
}

export function getProfileUnlockPriceId(
  currency: BillingCurrency = "EUR",
): string | undefined {
  const suffix = currency === "CHF" ? "_CHF" : "";
  return process.env[`STRIPE_PRICE_PROFILE_UNLOCK${suffix}`];
}

export function getSkiPassPriceId(currency: BillingCurrency = "EUR"): string | undefined {
  const suffix = currency === "CHF" ? "_CHF" : "";
  return process.env[`STRIPE_PRICE_SKI_PASS${suffix}`];
}

export function getProfileUnlockAmount(currency: BillingCurrency): number {
  return getCandidatePrices(currency).profileUnlock;
}

export function getSkiPassAmount(currency: BillingCurrency): number {
  return getCandidatePrices(currency).skiPass;
}
