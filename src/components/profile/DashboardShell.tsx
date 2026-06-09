"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardContent } from "@/components/profile/DashboardContent";

export function DashboardShell() {
  const t = useTranslations("profile");

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-800">
            <span className="text-cyan-600">Neva</span>jobs
          </Link>
          <Link
            href="/profile/setup"
            className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
          >
            {t("editProfile")} →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
        <DashboardContent />
      </main>
    </div>
  );
}
