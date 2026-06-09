"use client";

import { useState } from "react";
import { Check, Coins, Minus, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrustBadges } from "@/components/trust/TrustBadges";
import {
  currencyFromZona,
  formatMoney,
  getPlanPrices,
} from "@/lib/billing/currency";
import { isLaunchPromoActive } from "@/lib/billing/plans";
import type { ZonaEconomica } from "@/types";

const COMPARISON_ROWS = [
  "searchPost",
  "fullProfile",
  "voiceIntro",
  "emergencyRadar",
  "couplesFilter",
  "featuredOffers",
  "verifiedFilter",
] as const;

type ComparisonRow = (typeof COMPARISON_ROWS)[number];

const COMPARISON_VALUES: Record<
  ComparisonRow,
  { candidate: boolean; free: boolean; starter: boolean; pro: boolean; enterprise: boolean }
> = {
  searchPost: { candidate: true, free: true, starter: true, pro: true, enterprise: true },
  fullProfile: { candidate: false, free: false, starter: true, pro: true, enterprise: true },
  voiceIntro: { candidate: false, free: false, starter: true, pro: true, enterprise: true },
  emergencyRadar: { candidate: false, free: false, starter: false, pro: true, enterprise: true },
  couplesFilter: { candidate: false, free: false, starter: false, pro: true, enterprise: true },
  featuredOffers: { candidate: false, free: false, starter: false, pro: false, enterprise: true },
  verifiedFilter: { candidate: false, free: false, starter: false, pro: false, enterprise: true },
};

const ZONA_OPTIONS: ZonaEconomica[] = ["UE", "Suiza", "Andorra"];

export function Pricing() {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const [zona, setZona] = useState<ZonaEconomica>("UE");
  const currency = currencyFromZona(zona);
  const prices = getPlanPrices(currency);
  const showPromo = isLaunchPromoActive();

  const plans = [
    {
      id: "free" as const,
      name: t("free.name"),
      price: t("free.price"),
      period: t("free.period"),
      description: t("free.description"),
      features: [
        t("free.features.post"),
        t("free.features.browse"),
        t("free.features.search"),
      ],
      excluded: [t("free.features.cv"), t("free.features.chat")],
      cta: t("free.cta"),
      ctaHref: "/register?rol=empresa",
      highlighted: false,
    },
    {
      id: "starter" as const,
      name: t("starter.name"),
      price: formatMoney(prices.starter.monthly, currency, locale),
      period: t("perMonth"),
      altPrice: t("starter.seasonPrice", {
        price: formatMoney(prices.starter.season, currency, locale),
      }),
      description: t("starter.description"),
      features: [
        t("starter.features.post"),
        t("starter.features.unlocks"),
        t("starter.features.filters"),
        t("starter.features.ai"),
        t("starter.features.badge"),
      ],
      excluded: [],
      cta: t("starter.cta"),
      ctaHref: "/billing/upgrade?plan=starter",
      highlighted: false,
    },
    {
      id: "pro" as const,
      name: t("pro.name"),
      price: formatMoney(prices.pro.monthly, currency, locale),
      period: t("perMonth"),
      altPrice: t("pro.seasonPrice", {
        price: formatMoney(prices.pro.season, currency, locale),
      }),
      description: t("pro.description"),
      features: [
        t("pro.features.unlocks"),
        t("pro.features.emergency"),
        t("pro.features.couples"),
        t("pro.features.video"),
        t("pro.features.antiFugas"),
        t("pro.features.chat"),
      ],
      excluded: [],
      cta: t("pro.cta"),
      ctaHref: "/billing/upgrade?plan=pro",
      highlighted: true,
    },
    {
      id: "enterprise" as const,
      name: t("enterprise.name"),
      price: formatMoney(prices.enterprise.monthly, currency, locale),
      period: t("perMonth"),
      description: t("enterprise.description"),
      features: [
        t("enterprise.features.allPro"),
        t("enterprise.features.featured"),
        t("enterprise.features.ats"),
        t("enterprise.features.alerts"),
        t("enterprise.features.verified"),
        t("enterprise.features.support"),
        t("enterprise.features.multiAccount"),
      ],
      excluded: [],
      cta: t("enterprise.cta"),
      ctaHref: "/billing/upgrade?plan=enterprise",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-xl font-bold text-slate-900 sm:text-3xl">{t("title")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">{t("subtitle")}</p>
          <p className="mt-2 text-sm font-medium text-cyan-700">{t("seasonNote")}</p>
          <div className="mx-auto mt-5 inline-flex flex-wrap justify-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {ZONA_OPTIONS.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZona(z)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  zona === z
                    ? "bg-cyan-100 text-cyan-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t(`zones.${z}`)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t("currencyNote", { currency })}
          </p>
        </div>

        {showPromo && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">{t("launchPromo.title")}</p>
              <p className="mt-1 text-sm text-amber-800">{t("launchPromo.body")}</p>
            </div>
          </div>
        )}

        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("credits.title")}</h3>
                <p className="mt-1 text-sm text-slate-600">{t("credits.description")}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-slate-900">
                {formatMoney(prices.credit, currency, locale)}
                <span className="text-base font-normal text-slate-500">
                  {t("credits.perCredit")}
                </span>
              </p>
              <Link
                href="/billing/upgrade?plan=credits"
                className="mt-3 inline-flex rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                {t("credits.cta")}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              {...plan}
              mostPopularLabel={t("mostPopular")}
            />
          ))}
        </div>

        <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-semibold text-slate-700">
                  {t("comparison.title")}
                </th>
                <th className="px-3 py-3 text-center font-medium text-slate-600">
                  {t("comparison.candidate")}
                </th>
                <th className="px-3 py-3 text-center font-medium text-slate-600">
                  {t("free.name")}
                </th>
                <th className="px-3 py-3 text-center font-medium text-slate-600">
                  {t("starter.name")}
                </th>
                <th className="px-3 py-3 text-center font-medium text-slate-600">
                  {t("pro.name")}
                </th>
                <th className="px-3 py-3 text-center font-medium text-slate-600">
                  {t("enterprise.name")}
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 text-slate-700">
                    {t(`comparison.rows.${row}`)}
                  </td>
                  <ComparisonCell value={COMPARISON_VALUES[row].candidate} />
                  <ComparisonCell value={COMPARISON_VALUES[row].free} />
                  <ComparisonCell
                    value={COMPARISON_VALUES[row].starter}
                    label={
                      row === "fullProfile" ? t("comparison.starterUnlocks") : undefined
                    }
                  />
                  <ComparisonCell
                    value={COMPARISON_VALUES[row].pro}
                    label={
                      row === "fullProfile" ? t("comparison.unlimited") : undefined
                    }
                  />
                  <ComparisonCell
                    value={COMPARISON_VALUES[row].enterprise}
                    label={
                      row === "featuredOffers"
                        ? t("comparison.featuredIncluded")
                        : row === "fullProfile"
                          ? t("comparison.unlimited")
                          : undefined
                    }
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10">
          <TrustBadges variant="payment" className="mx-auto max-w-3xl" />
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">{t("footnote")}</p>
      </div>
    </section>
  );
}

function ComparisonCell({
  value,
  label,
}: {
  value: boolean;
  label?: string;
}) {
  return (
    <td className="px-3 py-3 text-center">
      {label ? (
        <span className="text-xs font-medium text-slate-600">{label}</span>
      ) : value ? (
        <Check className="mx-auto h-4 w-4 text-emerald-600" />
      ) : (
        <Minus className="mx-auto h-4 w-4 text-slate-300" />
      )}
    </td>
  );
}

function PricingCard({
  name,
  price,
  period,
  altPrice,
  description,
  features,
  excluded,
  cta,
  ctaHref,
  highlighted,
  mostPopularLabel,
}: {
  name: string;
  price: string;
  period: string;
  altPrice?: string;
  description: string;
  features: string[];
  excluded: string[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  mostPopularLabel: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${
        highlighted
          ? "border-cyan-300 bg-gradient-to-b from-cyan-50 to-white shadow-lg shadow-cyan-100 ring-2 ring-cyan-200"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {highlighted && (
        <span className="mb-3 w-fit rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
          {mostPopularLabel}
        </span>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      {altPrice && (
        <p className="mt-1 text-xs font-medium text-cyan-700">{altPrice}</p>
      )}
      <p className="mt-3 text-sm text-slate-600">{description}</p>

      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
        {excluded.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-400">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-6 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
          highlighted
            ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-sky-700"
            : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
