"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Clock,
  Globe,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { SprintProgressBar } from "@/components/profile/SprintProgressBar";
import {
  applyToJobApi,
  checkSprintComplete,
  startCandidateCheckout,
  translateCv,
} from "@/lib/data/candidatos-client";
import { getActiveOfertasClient } from "@/lib/data/ofertas-client";
import { getMyApplications } from "@/lib/data/postulaciones-client";
import {
  canApplyToOffer,
  canUseAdvancedFeatures,
  canUseCvTranslator,
  hasSkiPass,
} from "@/lib/billing/sprint-service";
import { computeMatch } from "@/lib/match/compute-match";
import type { CodigoIdioma, Oferta, Postulacion } from "@/types";

export function CandidatoDashboard() {
  const t = useTranslations("dashboard");
  const tSprint = useTranslations("sprint");
  const tMatch = useTranslations("match");
  const { profile, user, refreshProfile } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [applications, setApplications] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translatePreview, setTranslatePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.uid || !user) return;
    const candidatoId = profile.uid;

    async function load() {
      setLoading(true);
      try {
        const token = await user!.getIdToken();
        setIdToken(token);
        const [jobs, apps] = await Promise.all([
          getActiveOfertasClient(),
          getMyApplications(candidatoId),
        ]);
        setOfertas(jobs);
        setApplications(apps);
        await checkSprintComplete(token);
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [profile?.uid, user]);

  if (!profile || !user) return null;

  const appliedIds = new Set(applications.map((a) => a.oferta_id));
  const skiPass = hasSkiPass(profile);
  const advanced = canUseAdvancedFeatures(profile);

  const matches = ofertas
    .map((oferta) => ({
      oferta,
      match: computeMatch(oferta, profile),
      applyAccess: canApplyToOffer(profile, oferta),
    }))
    .filter(({ match }) => match.isMatch)
    .sort((a, b) => b.match.score - a.match.score);

  async function handleApply(oferta: Oferta) {
    if (!idToken) return;
    setApplyingId(oferta.id);
    setApplyError(null);
    try {
      const result = await applyToJobApi(idToken, { oferta_id: oferta.id });
      if (!result.ok) {
        if (result.code === "early_access" && result.unlocksAt) {
          setApplyError(
            tSprint("earlyAccessWait", {
              date: new Date(result.unlocksAt).toLocaleString(),
            }),
          );
        } else {
          setApplyError(result.error);
        }
        return;
      }
      const apps = await getMyApplications(profile!.uid);
      setApplications(apps);
    } finally {
      setApplyingId(null);
    }
  }

  async function handleCheckout(type: "ski_pass" | "profile_unlock") {
    if (!idToken) return;
    setCheckoutLoading(true);
    try {
      const url = await startCandidateCheckout(idToken, type);
      if (url) window.location.href = url;
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleTranslate(lang: CodigoIdioma) {
    if (!idToken) return;
    setTranslateLoading(true);
    try {
      const result = await translateCv(idToken, lang);
      setTranslatePreview(result?.preview ?? null);
    } finally {
      setTranslateLoading(false);
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
      <SprintProgressBar
        profile={profile}
        onBuySkiPass={() => handleCheckout("ski_pass")}
        onBuyUnlock={() => handleCheckout("profile_unlock")}
        checkoutLoading={checkoutLoading}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">{t("yourProfile")}</h2>
          {profile.badge_verified_speed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <Zap className="h-3.5 w-3.5" />
              {tSprint("badgeVerifiedSpeed")}
            </span>
          )}
          {skiPass && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-800">
              <BadgeCheck className="h-3.5 w-3.5" />
              {tSprint("badgeTopCandidate")}
            </span>
          )}
        </div>
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

        {!advanced && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {tSprint("advancedLocked")}
          </p>
        )}

        {canUseCvTranslator(profile) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-800">{tSprint("cvTranslator")}</p>
            <p className="mt-1 text-xs text-slate-500">{tSprint("cvTranslatorDesc")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["FR", "EN", "DE"] as CodigoIdioma[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleTranslate(lang)}
                  disabled={translateLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 disabled:opacity-60"
                >
                  {translateLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Globe className="h-3 w-3" />
                  )}
                  {lang}
                </button>
              ))}
            </div>
            {translatePreview && (
              <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700 whitespace-pre-wrap">
                {translatePreview}
              </pre>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-900">{t("matchesForYou")}</h2>
        </div>

        {applyError && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {applyError}
          </p>
        )}

        {matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            {t("noMatchesCandidate")}
          </p>
        ) : (
          <ul className="space-y-4">
            {matches.map(({ oferta, match, applyAccess }) => (
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
                    {oferta.incluye_alojamiento && (
                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        🏠 {t("accommodationIncluded")}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                    {tMatch("score", { score: match.score })}
                  </span>
                </div>

                {oferta.incluye_alojamiento && !applyAccess.allowed && applyAccess.unlocksAt && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                    <Clock className="h-3.5 w-3.5" />
                    {tSprint("earlyAccessCountdown", {
                      date: applyAccess.unlocksAt.toLocaleString(),
                    })}
                    {skiPass && ` — ${tSprint("skiPassSkip")}`}
                  </p>
                )}

                {oferta.incluye_alojamiento && skiPass && applyAccess.allowed && (
                  <p className="mt-2 text-xs font-semibold text-cyan-700">
                    {tSprint("earlyAccessActive")}
                  </p>
                )}

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
                      disabled={
                        applyingId === oferta.id || !applyAccess.allowed
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
                    >
                      {applyingId === oferta.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {!applyAccess.allowed
                        ? tSprint("earlyAccessLocked")
                        : t("applyMatch")}
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
