"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import {
  getAuthErrorKey,
  loginWithEmail,
  loginWithGoogle,
} from "@/lib/auth/auth-service";

export function LoginForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("auth.errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.push("/");
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
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(tErrors(getAuthErrorKey(code)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">{t("loginTitle")}</h1>
      <p className="mt-2 text-sm text-slate-600">{t("loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Field
          label={t("email")}
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label={t("password")}
          type="password"
          value={password}
          onChange={setPassword}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("signIn")}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">{t("or")}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-60"
      >
        {t("google")}
      </button>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-medium text-cyan-600 hover:text-cyan-700">
          {t("registerFree")}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}
