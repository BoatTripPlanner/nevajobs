"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LogOut, Shield } from "lucide-react";
import { signOut } from "@/lib/auth/auth-service";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/components/auth/AuthProvider";

export function AdminShell() {
  const t = useTranslations("admin");
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-slate-50">
      <header className="border-b border-violet-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-slate-900">
              Nevajobs <span className="text-violet-600">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user?.email}
            </span>
            <Link
              href="/"
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              {t("viewSite")}
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <AdminDashboard />
      </main>
    </div>
  );
}
