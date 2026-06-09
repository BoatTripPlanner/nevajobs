import type { Job } from "@/types/job";
import { JobCard } from "./JobCard";

interface JobListingsProps {
  jobs: Job[];
}

export function JobListings({ jobs }: JobListingsProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Latest opportunities
            </h2>
            <p className="mt-1 text-slate-400">
              Private-sector roles across Europe&apos;s top ski destinations
            </p>
          </div>
          <a
            href="/jobs"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            View all jobs →
          </a>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-12 text-center">
            <p className="text-slate-300">No active jobs match your search.</p>
            <p className="mt-1 text-sm text-slate-500">
              Check back soon — new roles are posted daily.
            </p>
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
