import { Zap } from "lucide-react";
import type { Candidate } from "@/types/job";
import { CandidateCard } from "./CandidateCard";

interface AvailableCandidatesProps {
  candidates: Candidate[];
}

export function AvailableCandidates({ candidates }: AvailableCandidatesProps) {
  return (
    <section className="border-y border-white/5 bg-gradient-to-b from-emerald-950/20 to-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                Emergency switch
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Available candidates now
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Employer feed — mid-season drop-outs and talent already in resort,
              ready to start immediately.
            </p>
          </div>
          <a
            href="/employers/candidates"
            className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300"
          >
            View full feed →
          </a>
        </div>

        {candidates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-500/20 bg-emerald-500/5 px-6 py-10 text-center">
            <p className="text-emerald-200">No candidates with immediate availability right now.</p>
            <p className="mt-1 text-sm text-slate-500">
              Candidates who enable the emergency switch appear here automatically.
            </p>
          </div>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
