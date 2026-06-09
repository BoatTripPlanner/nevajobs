"use client";

import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Check,
  Clock,
  Lock,
  Mic,
  FileText,
  Video,
  Zap,
} from "lucide-react";
import {
  canUseAdvancedFeatures,
  getSprintDaysRemaining,
  getSprintProgress,
  hasSkiPass,
  isProfileLocked,
  isSprintExpired,
} from "@/lib/billing/sprint-service";
import { TrustBadges } from "@/components/trust/TrustBadges";
import {
  formatMoney,
  getCandidatePrices,
  getUserBillingCurrency,
} from "@/lib/billing/currency";
import type { Usuario } from "@/types";
import { useLocale } from "next-intl";

const STEP_ICONS = {
  basic: Zap,
  experience: BadgeCheck,
  cv: FileText,
  voice: Mic,
  video: Video,
} as const;

export function SprintProgressBar({
  profile,
  onBuySkiPass,
  onBuyUnlock,
  checkoutLoading,
}: {
  profile: Usuario;
  onBuySkiPass?: () => void;
  onBuyUnlock?: () => void;
  checkoutLoading?: boolean;
}) {
  const t = useTranslations("sprint");
  const locale = useLocale();
  const currency = getUserBillingCurrency(profile);
  const candidatePrices = getCandidatePrices(currency);
  const daysLeft = getSprintDaysRemaining(profile);
  const { steps, percent } = getSprintProgress(profile);
  const expired = isSprintExpired(profile);
  const locked = isProfileLocked(profile);
  const advanced = canUseAdvancedFeatures(profile);
  const skiPass = hasSkiPass(profile);

  if (profile.badge_verified_speed) {
    return (
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-900">{t("verifiedSpeedTitle")}</p>
            <p className="text-sm text-emerald-700">{t("verifiedSpeedDesc")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (skiPass) {
    return (
      <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-900">{t("skiPassActiveTitle")}</p>
            <p className="text-sm text-cyan-700">{t("skiPassActiveDesc")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            {t("title")}
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {expired ? t("expiredTitle") : t("countdown", { days: daysLeft })}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {expired ? t("expiredDesc") : t("subtitle")}
          </p>
        </div>
        {!expired && (
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">
            <Clock className="h-4 w-4" />
            {t("daysLeft", { days: daysLeft })}
          </div>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-600">
          <span>{t("progress")}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-500 to-sky-600 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => {
          const Icon = STEP_ICONS[step.id];
          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                step.done
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                  : "bg-white text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {step.done ? (
                <Check className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
              )}
              {t(`steps.${step.id}`)}
            </li>
          );
        })}
      </ul>

      {locked && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-white/80 p-4">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{t("lockedTitle")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("lockedDesc")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {onBuyUnlock && (
                  <button
                    type="button"
                    onClick={onBuyUnlock}
                    disabled={checkoutLoading}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {t("unlockProfile", {
                      price: formatMoney(candidatePrices.profileUnlock, currency, locale),
                    })}
                  </button>
                )}
                {onBuySkiPass && (
                  <button
                    type="button"
                    onClick={onBuySkiPass}
                    disabled={checkoutLoading}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
                  >
                    {t("buySkiPass", {
                      price: formatMoney(candidatePrices.skiPass, currency, locale),
                    })}
                  </button>
                )}
              </div>
              <TrustBadges variant="payment" className="mt-4" />
            </div>
          </div>
        </div>
      )}

      {!locked && !advanced && !expired && (
        <p className="mt-4 text-xs text-cyan-700">{t("freeIfFast")}</p>
      )}
    </section>
  );
}
