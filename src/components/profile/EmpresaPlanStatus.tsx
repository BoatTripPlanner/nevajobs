"use client";

import { Link } from "@/i18n/navigation";
import { Coins, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLAN_LIMITS } from "@/lib/billing/plans";
import {
  getEffectivePlan,
  getMonthlyUnlocksRemaining,
} from "@/lib/billing/plan-access";
import type { Usuario } from "@/types";

export function EmpresaPlanStatus({ profile }: { profile: Usuario }) {
  const t = useTranslations("dashboard");
  const plan = getEffectivePlan(profile);
  const remaining = getMonthlyUnlocksRemaining(profile);
  const credits = profile.creditos_disponibles ?? 0;
  const monthlyLimit = PLAN_LIMITS[plan].desbloqueosMes;

  return (
    <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">
              {t("currentPlan")}
            </p>
            <p className="text-lg font-bold capitalize text-slate-900">{plan}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {remaining !== null && (
            <div>
              <p className="text-xs text-slate-500">{t("unlocksRemaining")}</p>
              <p className="font-bold text-slate-900">
                {remaining}
                {monthlyLimit !== null && (
                  <span className="font-normal text-slate-500"> / {monthlyLimit}</span>
                )}
              </p>
            </div>
          )}
          {remaining === null && plan !== "gratis" && (
            <div>
              <p className="text-xs text-slate-500">{t("unlocksRemaining")}</p>
              <p className="font-bold text-emerald-700">{t("unlimited")}</p>
            </div>
          )}
          <div>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <Coins className="h-3.5 w-3.5" />
              {t("creditsBalance")}
            </p>
            <p className="font-bold text-amber-800">{credits}</p>
          </div>
        </div>
      </div>

      {(plan === "gratis" || (remaining === 0 && credits === 0)) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/billing/upgrade?plan=pro"
            className="rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t("upgradePlan")}
          </Link>
          <Link
            href="/billing/upgrade?plan=credits"
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
          >
            {t("buyCredits")}
          </Link>
        </div>
      )}
    </section>
  );
}
