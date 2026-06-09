import { MapPin } from "lucide-react";
import type { Candidate } from "@/types/job";
import { VoiceIntroPlayer } from "./VoiceIntroPlayer";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const availabilityLabel = candidate.inResort
    ? "Immediate availability · In resort"
    : "Immediate availability";

  return (
    <article className="flex min-w-[280px] max-w-[320px] shrink-0 flex-col rounded-2xl border border-emerald-500/20 bg-slate-900/70 p-4 shadow-lg shadow-emerald-500/5 backdrop-blur sm:min-w-[300px]">
      <div className="mb-3 flex items-center gap-2">
        <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          {availabilityLabel}
        </span>
      </div>

      <h3 className="text-base font-bold text-white">{candidate.name}</h3>
      <p className="mt-0.5 text-sm text-cyan-300/90">{candidate.role}</p>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        {candidate.resort}, {candidate.country}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.languages.map((lang) => (
          <span
            key={lang}
            className="rounded border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-200"
          >
            {lang}
          </span>
        ))}
      </div>

      <div className="mt-3">
        <VoiceIntroPlayer
          duration={candidate.voiceIntroDuration}
          audioUrl={candidate.voiceIntroUrl}
        />
      </div>

      <button
        type="button"
        className="mt-3 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
      >
        Contact candidate
      </button>
    </article>
  );
}
