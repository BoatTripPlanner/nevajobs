"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Job } from "@/types/job";
import { JobCard } from "./JobCard";

interface JobListingsProps {
  jobs: Job[];
}

export function JobListings({ jobs }: JobListingsProps) {
  const t = useTranslations("jobs");

  return (
    <section id="jobs" className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-1 text-slate-500">{t("subtitle")}</p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
          >
            {t("viewAll")}
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-slate-700">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("emptySubtitle")}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
