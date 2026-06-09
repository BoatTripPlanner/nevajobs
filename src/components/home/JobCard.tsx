"use client";

import { Award, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Job } from "@/types/job";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const t = useTranslations("jobs");

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-100 sm:p-6">
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {t(`categories.${job.category}`)}
        </span>
        {job.accommodationIncluded && (
          <span className="accommodation-badge rounded-full px-3 py-1 text-xs font-semibold">
            {t("accommodationBadge")}
          </span>
        )}
        {job.couplesWelcome && (
          <span className="couples-badge rounded-full px-3 py-1 text-xs font-semibold">
            {t("couplesBadge")}
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 sm:text-xl">
        {job.title}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
        <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
        {job.resort}, {job.country}
      </p>

      {job.companyName && (
        <p className="mt-1 text-sm text-slate-400">{job.companyName}</p>
      )}

      {job.certificationRequired && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-700">
          <Award className="h-4 w-4" />
          {t("certificationRequired")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {job.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {lang}
          </span>
        ))}
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
      >
        {t("viewDetails")}
      </Link>
    </article>
  );
}
