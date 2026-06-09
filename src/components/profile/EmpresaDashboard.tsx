"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Bell,
  Download,
  Loader2,
  Mail,
  Plus,
  Radar,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CandidateMatchCard } from "@/components/profile/CandidateMatchCard";
import { EmpresaPlanStatus } from "@/components/profile/EmpresaPlanStatus";
import {
  canAccessEmergencyRadar,
  canExportAts,
  canUseAiOfferGenerator,
  canUseAntiFugasFilter,
  canUseBrandedOffers,
  canUseCombinedHiring,
  canUseCouplesFilter,
  canUseEmailAlerts,
  canUseVerifiedFilter,
  canUseVisaFilter,
  getReliabilityTier,
  isCoupleCandidate,
  isEmergencyCandidate,
} from "@/lib/billing/plan-access";
import { findCombinedHiringSuggestions } from "@/lib/match/combined-hiring";
import { fetchUnlockedCandidateIds } from "@/lib/data/desbloqueos-client";
import { fetchCandidatosForEmpresa } from "@/lib/data/candidatos-client";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createOferta, getEmpresaOfertas } from "@/lib/data/ofertas-client";
import { saveEmpresaAlertEmail } from "@/lib/profile/profile-service";
import { scrollToIdWhenReady } from "@/lib/scroll/scroll";
import { COLLECTIONS } from "@/types";
import { computeMatch } from "@/lib/match/compute-match";
import type { CandidatoPublicView } from "@/lib/privacy/sanitize-candidato";
import type { CategoriaOferta, Oferta, Usuario, ZonaEconomica } from "@/types";

const CATEGORY_OPTIONS: CategoriaOferta[] = ["hoteles", "escuelas", "alquiler", "oficina"];

export function EmpresaDashboard() {
  const t = useTranslations("dashboard");
  const tProfile = useTranslations("profile");
  const { user, profile, refreshProfile } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [candidatos, setCandidatos] = useState<CandidatoPublicView[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [couplesOnly, setCouplesOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [visaOnly, setVisaOnly] = useState(false);
  const [reliableOnly, setReliableOnly] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<{ titulo: string; descripcion: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [alertEmailInput, setAlertEmailInput] = useState("");
  const [savingAlertEmail, setSavingAlertEmail] = useState(false);
  const [alertEmailSaved, setAlertEmailSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setAlertEmailInput(profile.alerta_email ?? profile.email ?? "");
    }
  }, [profile?.uid, profile?.alerta_email, profile?.email]);

  useEffect(() => {
    if (showJobForm) scrollToIdWhenReady("job-form");
  }, [showJobForm]);

  useEffect(() => {
    if (!profile?.uid || !user) return;
    const empresaId = profile.uid;

    async function load() {
      setLoading(true);
      try {
        const token = await user!.getIdToken();
        setIdToken(token);
        const [jobs, cands, unlocked] = await Promise.all([
          getEmpresaOfertas(empresaId),
          fetchCandidatosForEmpresa(token),
          fetchUnlockedCandidateIds(token),
        ]);
        setOfertas(jobs);
        setCandidatos(cands.filter((c) => c.perfil_completo !== false));
        setUnlockedIds(new Set(unlocked));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [profile, user]);

  const filteredCandidatos = useMemo(() => {
    let list = candidatos;
    if (couplesOnly) {
      list = list.filter(isCoupleCandidate);
    }
    if (verifiedOnly) {
      list = list.filter((c) => c.verificado_nevajobs === true);
    }
    if (visaOnly) {
      list = list.filter((c) => c.permiso_trabajo_ue === true);
    }
    if (reliableOnly) {
      list = list.filter(
        (c) => getReliabilityTier(c.temporadas_completadas) !== "new",
      );
    }
    return list;
  }, [candidatos, couplesOnly, verifiedOnly, visaOnly, reliableOnly]);

  const emergencyCandidates = useMemo(
    () => filteredCandidatos.filter(isEmergencyCandidate),
    [filteredCandidatos],
  );

  if (!profile || !user) return null;

  const activeOfertas = ofertas.filter((o) => o.activa);
  const hasEmergencyAccess = canAccessEmergencyRadar(profile);
  const hasCouplesFilter = canUseCouplesFilter(profile);
  const hasVerifiedFilter = canUseVerifiedFilter(profile);
  const hasVisaFilter = canUseVisaFilter(profile);
  const hasAntiFugas = canUseAntiFugasFilter(profile);
  const hasAiOffers = canUseAiOfferGenerator(profile);
  const hasCombined = canUseCombinedHiring(profile);
  const hasAtsExport = canExportAts(profile);
  const hasBranded = canUseBrandedOffers(profile);
  const hasEmailAlerts = canUseEmailAlerts(profile);

  const combinedSuggestions = hasCombined
    ? findCombinedHiringSuggestions(activeOfertas, filteredCandidatos)
    : [];

  const matches = activeOfertas
    .flatMap((oferta) =>
      filteredCandidatos
        .map((candidato) => ({
          oferta,
          candidato,
          match: computeMatch(oferta, candidato),
        }))
        .filter(({ match }) => match.isMatch),
    )
    .sort((a, b) => b.match.score - a.match.score);

  async function handlePostJob(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setPosting(true);

    const form = new FormData(e.currentTarget);
    const idiomasRaw = String(form.get("idiomas") ?? "");
    const idiomas = idiomasRaw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const zona = (form.get("zona") as ZonaEconomica) || "UE";

    try {
      await updateDoc(doc(db, COLLECTIONS.USUARIOS, profile.uid), {
        zona_facturacion: zona,
      });
      await refreshProfile();

      await createOferta({
        titulo: String(form.get("titulo") ?? ""),
        descripcion: String(form.get("descripcion") ?? "") || aiDraft?.descripcion,
        empresa_id: profile.uid,
        nombre_empresa: profile.nombre,
        pais: String(form.get("pais") ?? ""),
        estacion: String(form.get("estacion") ?? ""),
        categoria: form.get("categoria") as CategoriaOferta,
        modalidad: (form.get("modalidad") as Oferta["modalidad"]) || undefined,
        incluye_alojamiento: form.get("alojamiento") === "on",
        acepta_parejas: form.get("parejas") === "on",
        idiomas_requeridos: idiomas,
        zona_economica: zona,
        destacada: hasBranded && form.get("destacada") === "on",
        marca_personalizada: hasBranded && form.get("marca") === "on",
        url_logo: hasBranded ? String(form.get("url_logo") ?? "") || undefined : undefined,
        url_foto_instalacion: hasBranded
          ? String(form.get("url_foto") ?? "") || undefined
          : undefined,
      });
      setAiDraft(null);

      const jobs = await getEmpresaOfertas(profile.uid);
      setOfertas(jobs);
      setShowJobForm(false);
      e.currentTarget.reset();
    } finally {
      setPosting(false);
    }
  }

  async function handleUnlocked(candidatoId: string) {
    setUnlockedIds((prev) => new Set([...prev, candidatoId]));
    setUnlockError(null);
    await refreshProfile();
  }

  async function handleGenerateOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasAiOffers || !idToken) return;
    setAiLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/employers/generate-offer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rol: form.get("ai_rol"),
          estacion: form.get("ai_estacion"),
          idioma: form.get("ai_idioma"),
        }),
      });
      if (!res.ok) {
        setUnlockError(t("aiOfferFailed"));
        return;
      }
      const data = (await res.json()) as { titulo: string; descripcion: string };
      setAiDraft(data);
      setShowJobForm(true);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSaveAlertEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingAlertEmail(true);
    setAlertEmailSaved(false);
    try {
      await saveEmpresaAlertEmail(profile.uid, alertEmailInput);
      await refreshProfile();
      setAlertEmailSaved(true);
    } catch {
      setUnlockError(t("alertEmailSaveFailed"));
    } finally {
      setSavingAlertEmail(false);
    }
  }

  async function handleAtsExport() {
    if (!idToken || !hasAtsExport) return;
    setExporting(true);
    try {
      const res = await fetch("/api/employers/ats-export", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        setUnlockError(t("atsExportFailed"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nevajobs-candidates.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
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
      <EmpresaPlanStatus profile={profile} />

      {unlockError && (
        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {unlockError}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{t("companyProfile")}</h2>
        <p className="mt-2 text-sm text-slate-600">{profile.descripcion_empresa}</p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {tProfile("hiringCategories")}
            </dt>
            <dd className="mt-0.5 font-medium text-slate-800">
              {profile.categorias_contratacion?.map((c) => tProfile(`categories.${c}`)).join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {t("activeJobs")}
            </dt>
            <dd className="mt-0.5 font-medium text-slate-800">{activeOfertas.length}</dd>
          </div>
        </dl>

        <form
          onSubmit={handleSaveAlertEmail}
          className="mt-5 border-t border-slate-100 pt-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-600" />
            <h3 className="text-sm font-semibold text-slate-900">{t("alertEmailSettings")}</h3>
            {hasEmailAlerts && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Enterprise
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {hasEmailAlerts ? t("alertEmailSettingsDesc") : t("alertEmailEnterpriseOnly")}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                {tProfile("alertEmail")}
              </span>
              <input
                type="email"
                value={alertEmailInput}
                onChange={(e) => setAlertEmailInput(e.target.value)}
                placeholder={profile.email}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
            <button
              type="submit"
              disabled={savingAlertEmail}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingAlertEmail && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("saveAlertEmail")}
            </button>
          </div>
          {alertEmailSaved && (
            <p className="mt-2 text-xs font-medium text-emerald-700">{t("alertEmailSaved")}</p>
          )}
          {hasEmailAlerts && (
            <p className="mt-2 text-xs text-slate-500">
              {t("emailAlertsActive", { email: alertEmailInput || profile.email })}
            </p>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{t("candidateFilters")}</h3>
          {hasAtsExport && (
            <button
              type="button"
              onClick={handleAtsExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {t("atsExport")}
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <FilterToggle
            label={t("visaFilter")}
            checked={visaOnly}
            disabled={!hasVisaFilter}
            lockedHint={t("starterRequired")}
            onChange={setVisaOnly}
          />
          <FilterToggle
            label={t("couplesFilter")}
            checked={couplesOnly}
            disabled={!hasCouplesFilter}
            lockedHint={t("proRequired")}
            onChange={setCouplesOnly}
          />
          <FilterToggle
            label={t("antiFugasFilter")}
            checked={reliableOnly}
            disabled={!hasAntiFugas}
            lockedHint={t("proRequired")}
            onChange={setReliableOnly}
          />
          <FilterToggle
            label={t("verifiedFilter")}
            checked={verifiedOnly}
            disabled={!hasVerifiedFilter}
            lockedHint={t("enterpriseRequired")}
            onChange={setVerifiedOnly}
          />
        </div>
      </section>

      {hasAiOffers && (
        <section className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50/80 to-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-cyan-600" />
            <h2 className="text-lg font-bold text-slate-900">{t("aiOfferGenerator")}</h2>
          </div>
          <p className="text-sm text-slate-600">{t("aiOfferDesc")}</p>
          <form onSubmit={handleGenerateOffer} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              name="ai_rol"
              required
              placeholder={t("aiRolPlaceholder")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="ai_estacion"
              required
              placeholder={t("aiResortPlaceholder")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="ai_idioma"
              required
              placeholder={t("aiLangPlaceholder")}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {aiLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("generateOffer")}
            </button>
          </form>
        </section>
      )}

      {hasCombined && combinedSuggestions.length > 0 && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
          <h2 className="text-lg font-bold text-slate-900">{t("combinedHiring")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("combinedHiringDesc")}</p>
          <ul className="mt-4 space-y-3">
            {combinedSuggestions.map((s) => (
              <li
                key={`${s.ofertaA.id}-${s.ofertaB.id}-${s.candidatoA.uid}`}
                className="rounded-xl border border-indigo-100 bg-white p-4 text-sm"
              >
                <p className="font-medium text-slate-900">
                  {s.candidatoA.nombre} + {s.candidatoB.nombre}
                </p>
                <p className="mt-1 text-slate-600">
                  {s.ofertaA.titulo} · {s.ofertaB.titulo} — {s.score}% match
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        className={`rounded-2xl border p-5 ${
          hasEmergencyAccess
            ? "border-orange-200 bg-gradient-to-br from-orange-50 to-white"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <Radar className={`h-5 w-5 ${hasEmergencyAccess ? "text-orange-600" : "text-slate-400"}`} />
          <h2 className="text-lg font-bold text-slate-900">{t("emergencyRadar")}</h2>
          {!hasEmergencyAccess && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
              Pro+
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600">
          {hasEmergencyAccess ? t("emergencyRadarDesc") : t("emergencyRadarLocked")}
        </p>
        {hasEmergencyAccess && (
          <ul className="mt-4 space-y-2">
            {emergencyCandidates.length === 0 ? (
              <li className="text-sm text-slate-500">{t("noEmergencyCandidates")}</li>
            ) : (
              emergencyCandidates.slice(0, 6).map((c) => (
                <li
                  key={c.uid}
                  className="rounded-lg border border-orange-100 bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-900">{c.nombre}</span>
                  <span className="text-slate-500">
                    {" "}
                    · {c.rol_buscado} · {c.estacion_actual}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">{t("yourJobs")}</h2>
          <button
            type="button"
            onClick={() => setShowJobForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
          >
            <Plus className="h-4 w-4" />
            {t("postJob")}
          </button>
        </div>

        {showJobForm && (
          <form
            id="job-form"
            onSubmit={handlePostJob}
            className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Field
              label={t("jobTitle")}
              name="titulo"
              defaultValue={aiDraft?.titulo}
              required
            />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                {t("jobDescription")}
              </span>
              <textarea
                name="descripcion"
                rows={4}
                defaultValue={aiDraft?.descripcion}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("country")} name="pais" required />
              <Field label={t("resort")} name="estacion" required />
            </div>
            <SelectField
              label={tProfile("hiringCategories")}
              name="categoria"
              options={CATEGORY_OPTIONS.map((c) => ({
                value: c,
                label: tProfile(`categories.${c}`),
              }))}
            />
            <Field
              label={t("requiredLanguages")}
              name="idiomas"
              placeholder="EN, FR, ES"
              required
            />
            <SelectField
              label={t("economicZone")}
              name="zona"
              options={[
                { value: "UE", label: t("zones.UE") },
                { value: "Suiza", label: t("zones.Suiza") },
                { value: "Andorra", label: t("zones.Andorra") },
              ]}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="alojamiento" className="rounded text-cyan-600" />
              {t("accommodationIncluded")}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="parejas"
                className="rounded text-cyan-600"
                disabled={!hasCouplesFilter}
              />
              {t("couplesWelcome")}
              {!hasCouplesFilter && (
                <span className="text-xs text-slate-400">(Pro+)</span>
              )}
            </label>
            {hasBranded && (
              <>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="marca" className="rounded text-cyan-600" />
                  {t("brandedOffer")}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="destacada" className="rounded text-cyan-600" />
                  {t("featuredOffer")}
                </label>
                <Field label={t("logoUrl")} name="url_logo" placeholder="https://..." />
                <Field label={t("photoUrl")} name="url_foto" placeholder="https://..." />
              </>
            )}
            <button
              type="submit"
              disabled={posting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {posting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("publishJob")}
            </button>
          </form>
        )}

        {activeOfertas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            {t("noJobsYet")}
          </p>
        ) : (
          <ul className="space-y-2">
            {activeOfertas.map((job) => (
              <li
                key={job.id}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium text-slate-900">{job.titulo}</span>
                <span className="text-slate-500"> · {job.estacion}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-900">{t("matchesForCompany")}</h2>
        </div>

        {matches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            {t("noMatchesCompany")}
          </p>
        ) : (
          <ul className="space-y-4">
            {matches.slice(0, 12).map(({ oferta, candidato, match }) => (
              <CandidateMatchCard
                key={`${oferta.id}-${candidato.uid}`}
                oferta={oferta}
                candidato={candidato}
                match={match}
                isUnlocked={unlockedIds.has(candidato.uid)}
                idToken={idToken}
                onUnlocked={handleUnlocked}
                onUnlockError={setUnlockError}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilterToggle({
  label,
  checked,
  disabled,
  lockedHint,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  lockedHint: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "cursor-pointer border-slate-200 bg-white text-slate-700"
      }`}
      title={disabled ? lockedHint : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded text-cyan-600"
      />
      {label}
      {disabled && <span className="text-xs">🔒</span>}
    </label>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        name={name}
        required
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
