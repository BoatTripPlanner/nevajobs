"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { Coins, Crown, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TrustBadges } from "@/components/trust/TrustBadges";
import {
  formatMoney,
  getPlanPrices,
  getUserBillingCurrency,
} from "@/lib/billing/currency";
import { isLaunchPromoActive, type BillingPeriod, type PlanId } from "@/lib/billing/plans";

export function PlanCheckout() {
  const t = useTranslations("billing");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [creditQty, setCreditQty] = useState(1);

  const initialPlan = (searchParams.get("plan") ?? "pro") as
    | PlanId
    | "credits"
    | "free";
  const [selectedPlan, setSelectedPlan] = useState<PlanId | "credits">(
    initialPlan === "credits"
      ? "credits"
      : initialPlan === "starter" || initialPlan === "enterprise"
        ? initialPlan
        : "pro",
  );

  const showPromo = isLaunchPromoActive();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/register?rol=empresa&plan=${selectedPlan}`);
      return;
    }
    if (profile && profile.rol !== "empresa") {
      setError(t("companiesOnly"));
    }
  }, [user, profile, loading, router, selectedPlan, t]);

  async function startCheckout() {
    if (!user) return;
    setCheckingOut(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const body =
        selectedPlan === "credits"
          ? { type: "credits" as const, quantity: creditQty }
          : {
              type: "subscription" as const,
              plan: selectedPlan,
              period,
            };

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setError(data.error ?? t("checkoutError"));
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t("genericError"));
    } finally {
      setCheckingOut(false);
    }
  }

  const currency = getUserBillingCurrency(profile);
  const prices = getPlanPrices(currency);

  if (loading || !user) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  const planOptions: { id: PlanId | "credits"; label: string; price: string }[] = [
    {
      id: "starter",
      label: t("plans.starter"),
      price: `${formatMoney(prices.starter.monthly, currency, locale)}${t("perMonthShort")}`,
    },
    {
      id: "pro",
      label: t("plans.pro"),
      price: `${formatMoney(prices.pro.monthly, currency, locale)}${t("perMonthShort")}`,
    },
    {
      id: "enterprise",
      label: t("plans.enterprise"),
      price: `${formatMoney(prices.enterprise.monthly, currency, locale)}${t("perMonthShort")}`,
    },
    {
      id: "credits",
      label: t("plans.credits"),
      price: `${formatMoney(prices.credit, currency, locale)}${t("perCredit")}`,
    },
  ];

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
        {selectedPlan === "credits" ? (
          <Coins className="h-6 w-6" />
        ) : (
          <Crown className="h-6 w-6" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-900">{t("choosePlan")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("choosePlanSubtitle")}</p>
      <p className="mt-2 text-xs font-medium text-cyan-700">
        {t("billingCurrency", { currency })}
      </p>

      {showPromo && selectedPlan === "pro" && period === "monthly" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          {t("launchPromo")}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        {planOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedPlan(opt.id)}
            className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
              selectedPlan === opt.id
                ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <span className="block font-semibold">{opt.label}</span>
            <span className="text-xs text-slate-500">{opt.price}</span>
          </button>
        ))}
      </div>

      {selectedPlan !== "credits" && (
        <div className="mt-4 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <PeriodButton
            active={period === "monthly"}
            onClick={() => setPeriod("monthly")}
            label={t("monthly")}
          />
          {selectedPlan !== "enterprise" && (
            <PeriodButton
              active={period === "season"}
              onClick={() => setPeriod("season")}
              label={t("seasonPass")}
            />
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
        {selectedPlan === "credits" ? (
          <>
            <label className="block text-sm font-medium text-slate-700">
              {t("creditQuantity")}
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={creditQty}
              onChange={(e) => setCreditQty(Number(e.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatMoney(creditQty * prices.credit, currency, locale)}
              <span className="text-sm font-normal text-slate-500">
                {" "}
                ({creditQty} {t("creditsLabel")})
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="text-3xl font-bold text-slate-900">
              {formatMoney(
                period === "monthly"
                  ? prices[selectedPlan].monthly
                  : (prices[selectedPlan].season ?? 0),
                currency,
                locale,
              )}
              <span className="text-base font-normal text-slate-500">
                {period === "monthly" ? t("perMonth") : t("seasonTotal")}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {period === "monthly" ? t("billedMonthly") : t("seasonBilling")}
            </p>
          </>
        )}
      </div>

      {profile?.plan_empresa && profile.plan_empresa !== "gratis" && (
        <p className="mt-4 text-sm text-slate-600">
          {t("currentPlan")}:{" "}
          <span className="font-semibold capitalize">{profile.plan_empresa}</span>
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {profile?.rol === "empresa" && (
        <button
          type="button"
          onClick={startCheckout}
          disabled={checkingOut}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
        >
          {checkingOut && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("checkout")}
        </button>
      )}

      <TrustBadges variant="payment" className="mt-6" />

      <p className="mt-4 text-center text-xs text-slate-500">{t("stripeNote")}</p>

      <p className="mt-4 text-center text-sm">
        <ScrollLink href="/#pricing" className="text-cyan-600 hover:text-cyan-700">
          {t("comparePlans")} →
        </ScrollLink>
      </p>
    </div>
  );
}

function PeriodButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
        active ? "bg-white text-cyan-800 shadow-sm" : "text-slate-500"
      }`}
    >
      {label}
    </button>
  );
}
