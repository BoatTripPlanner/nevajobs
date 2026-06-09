import type { Usuario, ZonaEconomica } from "@/types";

export type BillingCurrency = "EUR" | "CHF";

const SWISS_COUNTRY =
  /switzerland|suiza|schweiz|suisse|svizzera|swiss|ch\b/i;

export function isSwissCountry(pais?: string): boolean {
  return SWISS_COUNTRY.test((pais ?? "").trim());
}

export function currencyFromZona(zona: ZonaEconomica): BillingCurrency {
  return zona === "Suiza" ? "CHF" : "EUR";
}

export function resolveZonaFromCountry(pais?: string): ZonaEconomica | undefined {
  if (!pais?.trim()) return undefined;
  if (isSwissCountry(pais)) return "Suiza";
  if (/andorra/i.test(pais)) return "Andorra";
  return "UE";
}

export function getUserBillingCurrency(
  user:
    | Pick<Usuario, "pais_origen" | "zona_facturacion">
    | { pais_origen?: string; zona_facturacion?: ZonaEconomica }
    | null
    | undefined,
): BillingCurrency {
  if (!user) return "EUR";
  if (user.zona_facturacion) return currencyFromZona(user.zona_facturacion);
  if (isSwissCountry(user.pais_origen)) return "CHF";
  return "EUR";
}

export function formatMoney(
  amount: number,
  currency: BillingCurrency,
  locale = "en",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Precios B2B por moneda (misma escala nominal en CHF que en EUR). */
export const PLAN_PRICES_BY_CURRENCY = {
  EUR: {
    starter: { monthly: 39, season: 175 },
    pro: { monthly: 79, season: 350 },
    enterprise: { monthly: 149, season: null as number | null },
    credit: 5,
    featuredOffer: 29,
  },
  CHF: {
    starter: { monthly: 39, season: 175 },
    pro: { monthly: 79, season: 350 },
    enterprise: { monthly: 149, season: null as number | null },
    credit: 5,
    featuredOffer: 29,
  },
} as const;

export const CANDIDATE_PRICES_BY_CURRENCY = {
  EUR: { profileUnlock: 2.99, skiPass: 4.99 },
  CHF: { profileUnlock: 2.95, skiPass: 4.95 },
} as const;

export function getPlanPrices(currency: BillingCurrency) {
  return PLAN_PRICES_BY_CURRENCY[currency];
}

export function getCandidatePrices(currency: BillingCurrency) {
  return CANDIDATE_PRICES_BY_CURRENCY[currency];
}
