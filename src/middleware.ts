import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  buildLocalizedPathname,
  detectCountryCode,
  GEO_COUNTRY_COOKIE,
  GEO_COUNTRY_MAX_AGE,
  localeFromCountry,
  pathnameHasExplicitLocale,
} from "./lib/i18n/locale-from-country";

const intlMiddleware = createMiddleware(routing);
const LOCALE_COOKIE = "NEXT_LOCALE";

export default function middleware(request: NextRequest) {
  const country = detectCountryCode(request.headers);
  const pathname = request.nextUrl.pathname;
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE);
  const hasExplicitLocale = pathnameHasExplicitLocale(pathname);

  if (country && !hasExplicitLocale && !hasLocaleCookie) {
    const geoLocale = localeFromCountry(
      country,
      request.headers.get("accept-language"),
    );

    if (geoLocale && geoLocale !== routing.defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = buildLocalizedPathname(pathname, geoLocale);
      const response = NextResponse.redirect(url);
      response.cookies.set(LOCALE_COOKIE, geoLocale, {
        path: "/",
        sameSite: "lax",
        maxAge: GEO_COUNTRY_MAX_AGE,
      });
      response.cookies.set(GEO_COUNTRY_COOKIE, country, {
        path: "/",
        sameSite: "lax",
        maxAge: GEO_COUNTRY_MAX_AGE,
      });
      return response;
    }
  }

  const response = intlMiddleware(request);

  if (country && response instanceof NextResponse) {
    const existing = request.cookies.get(GEO_COUNTRY_COOKIE)?.value;
    if (existing?.toUpperCase() !== country) {
      response.cookies.set(GEO_COUNTRY_COOKIE, country, {
        path: "/",
        sameSite: "lax",
        maxAge: GEO_COUNTRY_MAX_AGE,
      });
    }
  }

  return response;
}

export const config = {
  // Exclude PWA/metadata routes (no file extension) so next-intl does not 404 them in production
  matcher: [
    "/((?!api|_next|_vercel|icon|apple-icon|manifest\\.webmanifest|.*\\..*).*)",
  ],
};
