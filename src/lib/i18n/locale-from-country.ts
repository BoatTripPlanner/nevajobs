import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

/** ISO 3166-1 alpha-2 → app locale for core ski markets. */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  ES: "es",
  FR: "fr",
  DE: "de",
  AT: "de",
  IT: "it",
  AD: "es",
  CH: "de",
};

const SWISS_LOCALES: Locale[] = ["de", "fr", "it"];

export const GEO_COUNTRY_COOKIE = "NEVAJOBS_COUNTRY";
export const GEO_COUNTRY_MAX_AGE = 60 * 60 * 24 * 365;

export function detectCountryCode(
  headers: Headers,
): string | undefined {
  const raw =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    undefined;

  const code = raw?.trim().toUpperCase();
  return code && code !== "XX" ? code : undefined;
}

function localeFromAcceptLanguage(
  acceptLanguage: string | null,
  locales: readonly Locale[],
  defaultLocale: Locale,
): Locale | undefined {
  if (!acceptLanguage) return undefined;

  try {
    const languages = new Negotiator({
      headers: { "accept-language": acceptLanguage },
    }).languages();

    const ordered = locales.slice().sort((a, b) => b.length - a.length);
    return match(languages, ordered, defaultLocale) as Locale;
  } catch {
    return undefined;
  }
}

export function localeFromCountry(
  countryCode: string | undefined,
  acceptLanguage?: string | null,
): Locale | undefined {
  if (!countryCode) return undefined;

  const country = countryCode.toUpperCase();

  if (country === "CH") {
    const preferred = localeFromAcceptLanguage(
      acceptLanguage ?? null,
      SWISS_LOCALES,
      "de",
    );
    return preferred && SWISS_LOCALES.includes(preferred) ? preferred : "de";
  }

  return COUNTRY_TO_LOCALE[country];
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return routing.defaultLocale;

  if (routing.locales.includes(segment as Locale)) {
    return segment as Locale;
  }

  return null;
}

export function pathnameHasExplicitLocale(pathname: string): boolean {
  const segment = pathname.split("/").filter(Boolean)[0];
  return (
    !!segment &&
    routing.locales.includes(segment as Locale) &&
    segment !== routing.defaultLocale
  );
}

export function buildLocalizedPathname(pathname: string, locale: Locale): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = normalized.split("/").filter(Boolean);

  if (segments[0] && routing.locales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  const rest = segments.length > 0 ? `/${segments.join("/")}` : "";

  if (locale === routing.defaultLocale) {
    return rest || "/";
  }

  return `/${locale}${rest}`;
}
