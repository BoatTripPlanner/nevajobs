import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { TrustBadges } from "@/components/trust/TrustBadges";

export default async function BillingSuccessPage() {
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
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            {t("successTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{t("successSubtitle")}</p>
          <TrustBadges variant="compact" badges={["stripe", "guarantee", "transparent"]} className="mt-6" />
          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-cyan-600 hover:to-sky-700"
          >
            {t("backHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
