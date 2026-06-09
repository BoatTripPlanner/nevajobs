"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Briefcase,
  Building2,
  Coins,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AdminDashboardData } from "@/lib/admin/admin-stats-server";
import type { StripeRevenueData } from "@/lib/admin/stripe-revenue-server";
import type { PlanEmpresa } from "@/types";

function formatEur(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function AdminDashboard() {
  const t = useTranslations("admin");
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [stripeData, setStripeData] = useState<StripeRevenueData | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [jobActionId, setJobActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    setStripeError(null);
    try {
      const token = await user.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, stripeRes] = await Promise.all([
        fetch("/api/admin/stats", { headers }),
        fetch("/api/admin/stripe-revenue", { headers }),
      ]);
      if (!statsRes.ok) {
        setError(t("forbidden"));
        return;
      }
      setData((await statsRes.json()) as AdminDashboardData);
      if (stripeRes.ok) {
        setStripeData((await stripeRes.json()) as StripeRevenueData);
      } else {
        const errBody = (await stripeRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        setStripeError(errBody?.error ?? t("stripeLoadError"));
      }
    } catch {
      setError(t("loadError"));
    }
  }, [user, t]);

  useEffect(() => {
    setLoading(true);
    void load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleSetPlan(uid: string, plan: PlanEmpresa) {
    if (!user) return;
    setActionMsg(null);
    const token = await user.getIdToken();
    const res = await fetch("/api/admin/set-plan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, plan }),
    });
    if (res.ok) {
      setActionMsg(t("planUpdated"));
      await load();
    } else {
      setActionMsg(t("actionFailed"));
    }
  }

  async function handleAddCredits(uid: string) {
    if (!user) return;
    const token = await user.getIdToken();
    await fetch("/api/admin/set-plan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid, add_credits: 5 }),
    });
    setActionMsg(t("creditsAdded"));
    await load();
  }

  async function handleOfertaAction(
    ofertaId: string,
    action: "delete" | "activate" | "deactivate",
  ) {
    if (!user) return;
    if (action === "delete" && !window.confirm(t("confirmDeleteJob"))) {
      return;
    }
    setJobActionId(ofertaId);
    setActionMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/oferta", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ofertaId, action }),
      });
      if (res.ok) {
        setActionMsg(
          action === "delete" ? t("jobDeleted") : t("jobStatusUpdated"),
        );
        await load();
      } else {
        setActionMsg(t("actionFailed"));
      }
    } catch {
      setActionMsg(t("actionFailed"));
    } finally {
      setJobActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
        {error ?? t("loadError")}
      </p>
    );
  }

  const { totals, plans, liveStats, recentUsers, recentOfertas } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-violet-600">{t("creatorBadge")}</p>
          <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-medium text-violet-700 shadow-sm hover:bg-violet-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {t("refresh")}
        </button>
      </div>

      {actionMsg && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMsg}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label={t("totalUsers")} value={totals.usuarios} />
        <StatCard icon={Building2} label={t("companies")} value={totals.empresas} />
        <StatCard icon={Briefcase} label={t("activeJobs")} value={totals.ofertasActivas} />
        <StatCard
          icon={Shield}
          label={t("unlocks")}
          value={totals.desbloqueos}
          sub={t("applications", { count: totals.postulaciones })}
        />
      </div>

      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 font-bold text-slate-900">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            {t("stripeRevenue")}
          </h2>
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:underline"
          >
            {t("stripeDashboard")} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        {stripeError ? (
          <p className="mt-4 text-sm text-amber-800">{stripeError}</p>
        ) : stripeData ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <RevenueStat
                label={t("stripeMrr")}
                value={formatEur(stripeData.mrrCents)}
              />
              <RevenueStat
                label={t("stripeLast30")}
                value={formatEur(stripeData.last30DaysRevenueCents)}
              />
              <RevenueStat
                label={t("stripeBalance")}
                value={formatEur(stripeData.balanceAvailable)}
                sub={
                  stripeData.balancePending > 0
                    ? t("stripePending", {
                        amount: formatEur(stripeData.balancePending),
                      })
                    : undefined
                }
              />
              <RevenueStat
                label={t("stripeSubscriptions")}
                value={String(stripeData.activeSubscriptions)}
              />
            </div>
            {stripeData.recentCharges.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2 pr-4">{t("stripeDate")}</th>
                      <th className="py-2 pr-4">{t("stripeAmount")}</th>
                      <th className="py-2 pr-4">{t("email")}</th>
                      <th className="py-2">{t("stripeStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stripeData.recentCharges.map((charge) => (
                      <tr key={charge.id} className="border-t border-emerald-100">
                        <td className="py-2 pr-4 text-slate-600">
                          {new Date(charge.created).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4 font-medium">
                          {formatEur(charge.amount)}
                        </td>
                        <td className="py-2 pr-4 text-slate-600">
                          {charge.customerEmail ?? "—"}
                        </td>
                        <td className="py-2 capitalize">{charge.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{t("stripeLoading")}</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">{t("liveStats")}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={t("liveJobs")} value={String(liveStats.activeJobs)} />
            <Row
              label={t("liveCandidates")}
              value={String(liveStats.availableCandidates)}
            />
            <Row
              label={t("topCountries")}
              value={liveStats.topCountries.join(", ") || "—"}
            />
            <Row label={t("profilesComplete")} value={String(totals.perfilesCompletos)} />
            <Row label={t("candidates")} value={String(totals.candidatos)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">{t("plansBreakdown")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(["gratis", "starter", "pro", "enterprise"] as PlanEmpresa[]).map(
              (plan) => (
                <li key={plan} className="flex justify-between capitalize">
                  <span className="text-slate-600">{plan}</span>
                  <span className="font-semibold text-slate-900">{plans[plan]}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-900">{t("quickLinks")}</h2>
        <div className="flex flex-wrap gap-3">
          <QuickLink href="/" label={t("viewSite")} />
          <QuickLink href="/billing/upgrade" label={t("billing")} />
          <QuickLink href="/dashboard" label={t("userDashboard")} />
          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Stripe <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Firebase <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">{t("recentUsers")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("name")}</th>
                <th className="px-4 py-3">{t("email")}</th>
                <th className="px-4 py-3">{t("role")}</th>
                <th className="px-4 py-3">{t("plan")}</th>
                <th className="px-4 py-3">{t("credits")}</th>
                <th className="px-4 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.uid} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.rol}</td>
                  <td className="px-4 py-3 capitalize">
                    {u.rol === "empresa" ? (u.plan_empresa ?? "gratis") : "—"}
                  </td>
                  <td className="px-4 py-3">{u.creditos_disponibles}</td>
                  <td className="px-4 py-3">
                    {u.rol === "empresa" && (
                      <div className="flex flex-wrap gap-1">
                        {(["starter", "pro", "enterprise"] as PlanEmpresa[]).map(
                          (p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => handleSetPlan(u.uid, p)}
                              className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium capitalize text-violet-800 hover:bg-violet-200"
                            >
                              {p}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          onClick={() => handleAddCredits(u.uid)}
                          className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
                        >
                          <Coins className="h-3 w-3" />
                          +5
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-slate-900">{t("recentJobs")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("jobTitle")}</th>
                <th className="px-4 py-3">{t("company")}</th>
                <th className="px-4 py-3">{t("resort")}</th>
                <th className="px-4 py-3">{t("status")}</th>
                <th className="px-4 py-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {recentOfertas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-slate-500">
                    {t("noJobs")}
                  </td>
                </tr>
              ) : (
                recentOfertas.map((job) => (
                  <tr key={job.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{job.titulo}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.nombre_empresa}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.estacion}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          job.activa
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.activa ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          disabled={jobActionId === job.id}
                          onClick={() =>
                            handleOfertaAction(
                              job.id,
                              job.activa ? "deactivate" : "activate",
                            )
                          }
                          className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                        >
                          {job.activa ? t("deactivate") : t("activate")}
                        </button>
                        <button
                          type="button"
                          disabled={jobActionId === job.id}
                          onClick={() => handleOfertaAction(job.id, "delete")}
                          className="inline-flex items-center gap-0.5 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 hover:bg-red-200 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-violet-600" />
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function RevenueStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-600">{label}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
