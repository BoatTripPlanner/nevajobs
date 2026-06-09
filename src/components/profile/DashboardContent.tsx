"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { CandidatoDashboard } from "@/components/profile/CandidatoDashboard";
import { EmpresaDashboard } from "@/components/profile/EmpresaDashboard";

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        {profile.rol === "empresa" ? t("titleCompany") : t("titleCandidate")}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        {profile.rol === "empresa" ? t("subtitleCompany") : t("subtitleCandidate")}
      </p>

      <div className="mt-8">
        {profile.rol === "empresa" ? <EmpresaDashboard /> : <CandidatoDashboard />}
      </div>
    </div>
  );
}
