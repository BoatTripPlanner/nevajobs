"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getActiveOfertasClient } from "@/lib/data/ofertas-client";
import { applyToJob, getMyApplications } from "@/lib/data/postulaciones-client";
import { computeMatch } from "@/lib/match/compute-match";
import type { Oferta, Postulacion } from "@/types";

export function CandidatoDashboard() {
  const t = useTranslations("dashboard");
  const tMatch = useTranslations("match");
  const { profile } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [applications, setApplications] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.uid) return;
    const candidatoId = profile.uid;

    async function load() {
      setLoading(true);
      try {
        const [jobs, apps] = await Promise.all([
          getActiveOfertasClient(),
          getMyApplications(candidatoId),
        ]);
        setOfertas(jobs);
        setApplications(apps);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [profile]);

  if (!profile) return null;

  const appliedIds = new Set(applications.map((a) => a.oferta_id));

  const matches = ofertas
    .map((oferta) => ({
      oferta,
      match: computeMatch(oferta, profile),
    }))
    .filter(({ match }) => match.isMatch)
    .sort((a, b) => b.match.score - a.match.score);

  async function handleApply(oferta: Oferta) {
    setApplyingId(oferta.id);
    try {
      await applyToJob({
        oferta_id: oferta.id,
        candidato_id: profile!.uid,
        empresa_id: oferta.empresa_id,
      });
      const apps = await getMyApplications(profile!.uid);
      setApplications(apps);
    } finally {
      setApplyingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{t("yourProfile")}</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Item label={t("roleSought")} value={profile.rol_buscado ?? "—"} />
          <Item label={t("languages")} value={profile.idiomas_hablados.join(", ") || "—"} />
          <Item label={t("country")} value={profile.pais_origen} />
          <Item
            label={t("availability")}
            value={
              profile.disponibilidad_inmediata ? t("immediate") : t("standard")
            }
          />
        </dl>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-900">{t("matchesForYou")}</h2>
        </div>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            {t("noMatchesCandidate")}
          </p>
        ) : (
          <ul className="space-y-4">
            {matches.map(({ oferta, match }) => (
              <li
                key={oferta.id}
                className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/30 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{oferta.titulo}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {oferta.nombre_empresa} · {oferta.estacion}, {oferta.pais}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                    {tMatch("score", { score: match.score })}
                  </span>
                </div>

                <ul className="mt-3 flex flex-wrap gap-2">
                  {match.reasons.slice(0, 4).map((reason) => (
                    <li
                      key={reason}
                      className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
                    >
                      {tMatch(`reasons.${reason}`)}
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  {appliedIds.has(oferta.id) ? (
                    <span className="inline-flex rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                      {t("applied")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApply(oferta)}
                      disabled={applyingId === oferta.id}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
                    >
                      {applyingId === oferta.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {t("applyMatch")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
