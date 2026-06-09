import { Award, MapPin } from "lucide-react";
import type { Job } from "@/types/job";

const categoryLabels: Record<Job["category"], string> = {
  hotels: "Hotels & Hospitality",
  schools: "Ski Schools & Clubs",
  rental: "Shops & Rental",
  office: "Office & Management",
};

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-6 transition hover:border-cyan-500/30 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-cyan-500/5">
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
          {categoryLabels[job.category]}
        </span>
        {job.accommodationIncluded && (
          <span className="accommodation-badge rounded-full px-3 py-1 text-xs font-semibold text-amber-200">
            🏠 Accommodation Included
          </span>
        )}
        {job.couplesWelcome && (
          <span className="couples-badge rounded-full px-3 py-1 text-xs font-semibold text-rose-200">
            🏠 Double Accommodation / Couples Welcome
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white group-hover:text-cyan-100">
        {job.title}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
        <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
        {job.resort}, {job.country}
      </p>

      {job.companyName && (
        <p className="mt-1 text-sm text-slate-500">{job.companyName}</p>
      )}

      {job.certificationRequired && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-300/90">
          <Award className="h-4 w-4" />
          Certification required
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {job.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300"
          >
            {lang}
          </span>
        ))}
      </div>

      <a
        href={`/jobs/${job.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white"
      >
        View details
      </a>
    </article>
  );
}
