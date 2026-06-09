"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2, Plus, Radar, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CandidateMatchCard } from "@/components/profile/CandidateMatchCard";
import { EmpresaPlanStatus } from "@/components/profile/EmpresaPlanStatus";
import {
  canAccessEmergencyRadar,
  canUseCouplesFilter,
  canUseVerifiedFilter,
  isCoupleCandidate,
  isEmergencyCandidate,
} from "@/lib/billing/plan-access";
import { fetchUnlockedCandidateIds } from "@/lib/data/desbloqueos-client";
import {
  createOferta,
  getAvailableCandidatos,
  getEmpresaOfertas,
} from "@/lib/data/ofertas-client";
import { computeMatch } from "@/lib/match/compute-match";
import type { CategoriaOferta, Oferta, Usuario, ZonaEconomica } from "@/types";

const CATEGORY_OPTIONS: CategoriaOferta[] = ["hoteles", "escuelas", "alquiler", "oficina"];

export function EmpresaDashboard() {
  const t = useTranslations("dashboard");
  const tProfile = useTranslations("profile");
  const { user, profile, refreshProfile } = useAuth();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [candidatos, setCandidatos] = useState<Usuario[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [couplesOnly, setCouplesOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string>("");

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
          getAvailableCandidatos(),
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
    return list;
  }, [candidatos, couplesOnly, verifiedOnly]);

  const emergencyCandidates = useMemo(
    () => filteredCandidatos.filter(isEmergencyCandidate),
    [filteredCandidatos],
  );

  if (!profile || !user) return null;

  const activeOfertas = ofertas.filter((o) => o.activa);
  const hasEmergencyAccess = canAccessEmergencyRadar(profile);
  const hasCouplesFilter = canUseCouplesFilter(profile);
  const hasVerifiedFilter = canUseVerifiedFilter(profile);

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

    try {
      await createOferta({
        titulo: String(form.get("titulo") ?? ""),
        empresa_id: profile.uid,
        nombre_empresa: profile.nombre,
        pais: String(form.get("pais") ?? ""),
        estacion: String(form.get("estacion") ?? ""),
        categoria: form.get("categoria") as CategoriaOferta,
        modalidad: (form.get("modalidad") as Oferta["modalidad"]) || undefined,
        incluye_alojamiento: form.get("alojamiento") === "on",
        acepta_parejas: form.get("parejas") === "on",
        idiomas_requeridos: idiomas,
        zona_economica: (form.get("zona") as ZonaEconomica) || "UE",
      });

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
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">{t("candidateFilters")}</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <FilterToggle
            label={t("couplesFilter")}
            checked={couplesOnly}
            disabled={!hasCouplesFilter}
            lockedHint={t("proRequired")}
            onChange={setCouplesOnly}
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
            onSubmit={handlePostJob}
            className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Field label={t("jobTitle")} name="titulo" required />
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
                { value: "UE", label: "EU / EEA" },
                { value: "Suiza", label: "Switzerland" },
                { value: "Andorra", label: "Andorra" },
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
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
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
