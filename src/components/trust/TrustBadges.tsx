"use client";

import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  CreditCard,
  Eye,
  FileLock,
  Lock,
  Mountain,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const TRUST_BADGE_IDS = [
  "stripe",
  "ssl",
  "gdpr",
  "verified",
  "cvPrivacy",
  "guarantee",
  "transparent",
  "europe",
] as const;

export type TrustBadgeId = (typeof TRUST_BADGE_IDS)[number];
export type TrustBadgeVariant = "compact" | "grid" | "strip" | "payment";

const BADGE_ICONS: Record<TrustBadgeId, LucideIcon> = {
  stripe: CreditCard,
  ssl: Lock,
  gdpr: ShieldCheck,
  verified: BadgeCheck,
  cvPrivacy: FileLock,
  guarantee: RotateCcw,
  transparent: Eye,
  europe: Mountain,
};

const DEFAULT_BY_VARIANT: Record<TrustBadgeVariant, TrustBadgeId[]> = {
  compact: ["stripe", "ssl", "gdpr"],
  strip: ["stripe", "gdpr", "verified", "cvPrivacy"],
  grid: TRUST_BADGE_IDS as unknown as TrustBadgeId[],
  payment: ["stripe", "ssl", "gdpr"],
};

export function TrustBadges({
  variant = "compact",
  badges,
  className = "",
}: {
  variant?: TrustBadgeVariant;
  badges?: TrustBadgeId[];
  className?: string;
}) {
  const t = useTranslations("trustBadges");
  const ids = badges ?? DEFAULT_BY_VARIANT[variant];

  if (variant === "payment") {
    return (
      <div
        className={`rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-4 ${className}`}
      >
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-emerald-800">
          {t("paymentTitle")}
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {ids.map((id) => (
            <PaymentBadge key={id} id={id} label={t(`${id}.label`)} hint={t(`${id}.hint`)} />
          ))}
        </ul>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
          {t("paymentFootnote")}
        </p>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {ids.map((id) => {
          const Icon = BADGE_ICONS[id];
          return (
            <article
              key={id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{t(`${id}.label`)}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{t(`${id}.hint`)}</p>
            </article>
          );
        })}
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${className}`}
        role="list"
        aria-label={t("ariaLabel")}
      >
        {ids.map((id) => (
          <StripBadge key={id} id={id} label={t(`${id}.label`)} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
      role="list"
      aria-label={t("ariaLabel")}
    >
      {ids.map((id) => (
        <CompactBadge key={id} id={id} label={t(`${id}.label`)} />
      ))}
    </div>
  );
}

function CompactBadge({ id, label }: { id: TrustBadgeId; label: string }) {
  const Icon = BADGE_ICONS[id];
  return (
    <span
      role="listitem"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-600" aria-hidden />
      {label}
    </span>
  );
}

function StripBadge({ id, label }: { id: TrustBadgeId; label: string }) {
  const Icon = BADGE_ICONS[id];
  return (
    <span
      role="listitem"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      {label}
    </span>
  );
}

function PaymentBadge({
  id,
  label,
  hint,
}: {
  id: TrustBadgeId;
  label: string;
  hint: string;
}) {
  const Icon = BADGE_ICONS[id];
  return (
    <li className="flex flex-col items-center text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="mt-2 text-xs font-bold text-slate-900">{label}</span>
      <span className="mt-0.5 text-[10px] leading-snug text-slate-600">{hint}</span>
    </li>
  );
}
