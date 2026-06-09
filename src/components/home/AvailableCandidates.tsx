import { Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Candidate } from "@/types/job";
import { CandidateCard } from "./CandidateCard";

interface AvailableCandidatesProps {
  candidates: Candidate[];
}

export async function AvailableCandidates({
  candidates,
}: AvailableCandidatesProps) {
  const t = await getTranslations("candidates");

  return (
    <section className="border-y border-emerald-100 bg-gradient-to-b from-emerald-50/80 to-sky-50/50 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {t("emergencyBadge")}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">{t("subtitle")}</p>
          </div>
          <Link
            href="/employers/candidates"
            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            {t("viewAll")}
          </Link>
        </div>

        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-10 text-center">
            <p className="text-emerald-800">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("emptySubtitle")}</p>
          </div>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:gap-4 sm:px-0">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
