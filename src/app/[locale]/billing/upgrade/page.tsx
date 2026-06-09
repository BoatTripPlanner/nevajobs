"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function BillingUpgradePage() {
  const t = useTranslations("billing");
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/register?plan=premium&rol=empresa");
      return;
    }

    if (profile && profile.rol !== "empresa") {
      setError(t("premiumCompaniesOnly"));
    }

    if (profile?.es_premium) {
      router.replace("/billing/success");
    }
  }, [user, profile, loading, router]);

  async function startCheckout() {
    if (!user) return;

    setCheckingOut(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  if (loading || !user) {
    return (
      <PageShell>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-600" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white">
          <Crown className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{t("upgradeTitle")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("upgradeSubtitle")}</p>

        <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
          <p className="text-3xl font-bold text-slate-900">
            €49
            <span className="text-base font-normal text-slate-500">
              {t("perMonth")}
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-600">{t("billedMonthly")}</p>
        </div>

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

        <p className="mt-4 text-center text-xs text-slate-500">{t("stripeNote")}</p>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-800">
          <span className="text-cyan-600">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {children}
      </main>
    </div>
  );
}
