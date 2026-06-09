import {
  currencyFromZona,
  type BillingCurrency,
} from "@/lib/billing/currency";
import { GEO_COUNTRY_COOKIE } from "@/lib/i18n/locale-from-country";
import type { ZonaEconomica } from "@/types";

export function getZonaFromCountry(
  countryCode?: string | null,
): ZonaEconomica {
  const country = countryCode?.trim().toUpperCase();
  if (country === "CH") return "Suiza";
  if (country === "AD") return "Andorra";
  return "UE";
}

export function getVisitorBillingZone(
  countryCode?: string | null,
): ZonaEconomica {
  return getZonaFromCountry(countryCode);
}

export function getVisitorBillingCurrency(
  countryCode?: string | null,
): BillingCurrency {
  return currencyFromZona(getVisitorBillingZone(countryCode));
}

export function readGeoCountryCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${GEO_COUNTRY_COOKIE}=([^;]*)`),
  );
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  return value?.toUpperCase();
}
