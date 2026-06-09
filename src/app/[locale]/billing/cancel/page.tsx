import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function BillingCancelPage() {
  const t = await getTranslations("billing");

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-800">
          <span className="text-cyan-600">Neva</span>jobs
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">{t("cancelTitle")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("cancelSubtitle")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/billing/upgrade"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700"
            >
              {t("tryAgain")}
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-sky-50"
            >
              {t("backHome")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
