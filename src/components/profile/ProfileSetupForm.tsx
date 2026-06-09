"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  saveCandidatoProfile,
  saveEmpresaProfile,
} from "@/lib/profile/profile-service";
import type { CategoriaOferta, CodigoIdioma, ModalidadDeportiva } from "@/types";

const LANGUAGE_OPTIONS: CodigoIdioma[] = ["EN", "ES", "FR", "DE", "IT", "PT", "NL"];
const CATEGORY_OPTIONS: CategoriaOferta[] = ["hoteles", "escuelas", "alquiler", "oficina"];
const MODALITY_OPTIONS: ModalidadDeportiva[] = ["ski", "snowboard", "both"];

export function ProfileSetupForm() {
  const t = useTranslations("profile");
  const { profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  async function handleCandidatoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const idiomas = LANGUAGE_OPTIONS.filter((lang) => form.get(`lang-${lang}`) === "on");

    try {
      await saveCandidatoProfile(profile.uid, {
        rol_buscado: String(form.get("rol_buscado") ?? ""),
        idiomas_hablados: idiomas,
        titulacion: String(form.get("titulacion") ?? ""),
        modalidad_principal: (form.get("modalidad") as ModalidadDeportiva) || undefined,
        estacion_actual: String(form.get("estacion") ?? ""),
        disponibilidad_inmediata: form.get("disponibilidad") === "on",
        permiso_trabajo_ue: form.get("permiso") === "on",
        en_estacion: form.get("en_estacion") === "on",
      });
      await refreshProfile();
      router.push("/dashboard");
    } catch {
      setError(t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEmpresaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const categorias = CATEGORY_OPTIONS.filter((cat) => form.get(`cat-${cat}`) === "on");
    const estacionesRaw = String(form.get("estaciones") ?? "");
    const estaciones = estacionesRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await saveEmpresaProfile(profile.uid, {
        descripcion_empresa: String(form.get("descripcion") ?? ""),
        categorias_contratacion: categorias,
        estaciones_operacion: estaciones,
        sitio_web: String(form.get("sitio_web") ?? ""),
        alerta_email: String(form.get("alerta_email") ?? ""),
      });
      await refreshProfile();
      router.push("/dashboard");
    } catch {
      setError(t("saveError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">{t("setupTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {profile.rol === "candidato" ? t("setupCandidateSubtitle") : t("setupCompanySubtitle")}
      </p>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {profile.rol === "candidato" ? (
        <form onSubmit={handleCandidatoSubmit} className="mt-8 space-y-5">
          <Field
            label={t("roleSought")}
            name="rol_buscado"
            defaultValue={profile.rol_buscado ?? ""}
            placeholder={t("roleSoughtPlaceholder")}
            required
          />
          <Field
            label={t("certification")}
            name="titulacion"
            defaultValue={profile.titulacion ?? ""}
            placeholder="ESF Level 2, BASI..."
          />
          <SelectField
            label={t("modality")}
            name="modalidad"
            defaultValue={profile.modalidad_principal ?? ""}
            options={[
              { value: "", label: t("modalityAny") },
              ...MODALITY_OPTIONS.map((m) => ({ value: m, label: t(`modalities.${m}`) })),
            ]}
          />
          <Field
            label={t("currentResort")}
            name="estacion"
            defaultValue={profile.estacion_actual ?? ""}
            placeholder="Val d'Isère, Zermatt..."
          />

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("languagesSpoken")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((lang) => (
                <CheckboxChip
                  key={lang}
                  name={`lang-${lang}`}
                  label={lang}
                  defaultChecked={profile.idiomas_hablados?.includes(lang)}
                />
              ))}
            </div>
          </fieldset>

          <CheckboxField
            name="disponibilidad"
            label={t("immediateAvailability")}
            defaultChecked={profile.disponibilidad_inmediata}
          />
          <CheckboxField
            name="en_estacion"
            label={t("alreadyInResort")}
            defaultChecked={profile.en_estacion}
          />
          <CheckboxField
            name="permiso"
            label={t("euWorkPermit")}
            defaultChecked={profile.permiso_trabajo_ue}
          />

          <SubmitButton loading={loading} label={t("saveAndContinue")} />
        </form>
      ) : (
        <form onSubmit={handleEmpresaSubmit} className="mt-8 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{profile.nombre}</span>
            <span className="mx-2">·</span>
            {profile.pais_origen}
          </div>

          <TextAreaField
            label={t("companyDescription")}
            name="descripcion"
            defaultValue={profile.descripcion_empresa ?? ""}
            placeholder={t("companyDescriptionPlaceholder")}
            required
          />

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t("hiringCategories")}
            </legend>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <CheckboxChip
                  key={cat}
                  name={`cat-${cat}`}
                  label={t(`categories.${cat}`)}
                  defaultChecked={profile.categorias_contratacion?.includes(cat)}
                />
              ))}
            </div>
          </fieldset>

          <Field
            label={t("operatingResorts")}
            name="estaciones"
            defaultValue={profile.estaciones_operacion?.join(", ") ?? ""}
            placeholder={t("operatingResortsPlaceholder")}
          />
          <Field
            label={t("website")}
            name="sitio_web"
            type="url"
            defaultValue={profile.sitio_web ?? ""}
            placeholder="https://..."
          />
          <Field
            label={t("alertEmail")}
            name="alerta_email"
            type="email"
            defaultValue={profile.alerta_email ?? profile.email}
            placeholder={profile.email}
          />
          <p className="-mt-3 text-xs text-slate-500">{t("alertEmailHint")}</p>

          <SubmitButton loading={loading} label={t("saveAndContinue")} />
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
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
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value || "empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxChip({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm has-[:checked]:border-cyan-300 has-[:checked]:bg-cyan-50">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
      />
      {label}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
