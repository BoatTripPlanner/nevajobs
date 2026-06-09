import { Briefcase, Building2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { TrustBadges } from "@/components/trust/TrustBadges";

export function TrustSection() {
  const t = useTranslations("trust");

  return (
    <section className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 text-center sm:mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{t("title")}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <article className="rounded-xl border border-sky-100 bg-sky-50/40 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-cyan-600 shadow-sm">
              <Briefcase className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">{t("candidatesTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("candidatesDesc")}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-slate-900">{t("companiesTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {t("companiesDesc")}
            </p>
          </article>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-8">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("qualityTitle")}
          </p>
          <TrustBadges variant="grid" />
        </div>
      </div>
    </section>
  );
}
