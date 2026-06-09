"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  getAuthErrorMessage,
  loginWithGoogle,
  registerWithEmail,
} from "@/lib/auth/auth-service";
import type { RolUsuario } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [paisOrigen, setPaisOrigen] = useState("");
  const [rol, setRol] = useState<RolUsuario>("candidato");
  const [disponibilidadInmediata, setDisponibilidadInmediata] = useState(false);
  const [permisoTrabajoUe, setPermisoTrabajoUe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        disponibilidad_inmediata: rol === "candidato" ? disponibilidadInmediata : false,
        permiso_trabajo_ue: rol === "candidato" ? permisoTrabajoUe : false,
      });
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(rol);
      router.push("/");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <p className="mt-2 text-sm text-slate-400">
        Candidates join free · Companies publish free
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-1">
          <RoleButton active={rol === "candidato"} onClick={() => setRol("candidato")}>
            Candidate
          </RoleButton>
          <RoleButton active={rol === "empresa"} onClick={() => setRol("empresa")}>
            Company
          </RoleButton>
        </div>

        <Field label="Full name" value={nombre} onChange={setNombre} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
        />
        <Field
          label={rol === "empresa" ? "Country / HQ" : "Country of origin"}
          value={paisOrigen}
          onChange={setPaisOrigen}
          required
        />

        {rol === "candidato" && (
          <div className="space-y-2 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <Checkbox
              checked={disponibilidadInmediata}
              onChange={setDisponibilidadInmediata}
              label="Immediate availability / already in resort"
            />
            <Checkbox
              checked={permisoTrabajoUe}
              onChange={setPermisoTrabajoUe}
              label="Authorized to work in the EU / EEA"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-sky-500 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full rounded-xl border border-white/15 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          Sign in
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
          ? "bg-cyan-500/20 text-cyan-200"
          : "text-slate-400 hover:text-slate-200"
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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
      />
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-800 text-cyan-500"
      />
      <span className="text-sm text-slate-300">{label}</span>
    </label>
  );
}
