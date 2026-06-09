"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import {
  ChevronDown,
  Crown,
  Loader2,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { signOut } from "@/lib/auth/auth-service";
import { supportedLocales } from "@/lib/data/filter-keys";
import type { Locale } from "@/i18n/routing";
import { LocaleFlag } from "@/components/ui/LocaleFlag";

export function Navbar() {
  const t = useTranslations("nav");
  const tLocales = useTranslations("locales");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  function switchLocale(code: Locale) {
    router.replace(pathname, { locale: code });
    setLangOpen(false);
  }

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-base font-bold text-white shadow-md shadow-cyan-500/20 sm:h-9 sm:w-9 sm:text-lg">
            N
          </span>
          <span className="truncate text-lg font-bold tracking-tight sm:text-xl">
            <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
              Neva
            </span>
            <span className="text-slate-800">jobs</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-sky-50 sm:min-h-0 sm:min-w-0 sm:px-3"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <LocaleFlag locale={locale} />
              <span className="hidden sm:inline">{tLocales(locale)}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              >
                {supportedLocales.map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={locale === item.code}
                      onClick={() => switchLocale(item.code)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50 hover:text-cyan-700"
                    >
                      <LocaleFlag locale={item.code} />
                      {tLocales(item.code)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          ) : user ? (
            <>
              {profile?.rol === "empresa" && !profile.es_premium && (
                <Link
                  href="/billing/upgrade"
                  className="hidden items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 sm:inline-flex"
                >
                  <Crown className="h-4 w-4" />
                  {t("goPremium")}
                </Link>
              )}
              {profile?.es_premium && (
                <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 sm:inline-flex">
                  <Crown className="h-3.5 w-3.5" />
                  {t("premium")}
                </span>
              )}
              <span className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:inline">
                {profile?.nombre ?? user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 sm:min-h-0 sm:min-w-0 sm:px-3"
              >
                {signingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{t("signOut")}</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-sky-50 sm:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-sky-700 sm:px-4"
              >
                <UserPlus className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t("register")}</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
