"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import {
  getAuthErrorKey,
  loginWithGoogle,
  registerWithEmail,
} from "@/lib/auth/auth-service";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import type { RolUsuario } from "@/types";

export function RegisterForm({
  defaultRol,
  redirectAfter,
}: {
  defaultRol?: RolUsuario;
  redirectAfter?: string;
}) {
  const t = useTranslations("auth");
  const tErrors = useTranslations("auth.errors");
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [rol, setRol] = useState<RolUsuario>(defaultRol ?? "candidato");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultRol) setRol(defaultRol);
  }, [defaultRol]);

  function afterAuthRedirect() {
    router.push(redirectAfter ?? "/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail({
        nombre,
        email,
        password,
        rol,
        pais_origen: paisOrigen,
      });
      afterAuthRedirect();
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(tErrors(getAuthErrorKey(code)));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(rol);
      afterAuthRedirect();
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(tErrors(getAuthErrorKey(code)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">{t("registerTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("registerSubtitle")}</p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className={`space-y-4 ${error ? "mt-4" : "mt-8"}`}>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <RoleButton active={rol === "candidato"} onClick={() => setRol("candidato")}>
            {t("candidate")}
          </RoleButton>
          <RoleButton active={rol === "empresa"} onClick={() => setRol("empresa")}>
            {t("company")}
          </RoleButton>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-60"
        >
          <GoogleLogo />
          {t("google")}
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">{t("or")}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t("fullName")} value={nombre} onChange={setNombre} required />
        <Field label={t("email")} type="email" value={email} onChange={setEmail} required />
        <Field
          label={t("password")}
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
        />
        <Field
          label={rol === "empresa" ? t("countryHq") : t("countryOrigin")}
          value={paisOrigen}
          onChange={setPaisOrigen}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("createAccount")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-medium text-cyan-600 hover:text-cyan-700">
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg py-2.5 text-sm font-medium transition ${
        active
          ? "bg-cyan-100 text-cyan-800"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  minLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}
