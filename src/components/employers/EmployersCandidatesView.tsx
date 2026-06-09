import { Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CandidateCard } from "@/components/home/CandidateCard";
import type { Candidate } from "@/types/job";

interface EmployersCandidatesViewProps {
  candidates: Candidate[];
}

export async function EmployersCandidatesView({
  candidates,
}: EmployersCandidatesViewProps) {
  const t = await getTranslations("candidates");
  const tPage = await getTranslations("employersCandidates");

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {t("emergencyBadge")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">
            {tPage("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            {tPage("subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            href="/register?rol=empresa"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-sky-700"
          >
            {tPage("cta")}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
          >
            {tPage("ctaLoggedIn")} →
          </Link>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-12 text-center">
          <p className="text-emerald-800">{t("emptyTitle")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("emptySubtitle")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="min-w-0">
              <CandidateCard candidate={candidate} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
