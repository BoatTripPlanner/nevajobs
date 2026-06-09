"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Candidate } from "@/types/job";
import { VoiceIntroPlayer } from "./VoiceIntroPlayer";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const t = useTranslations("candidates");

  const availabilityLabel = candidate.inResort
    ? t("immediateInResort")
    : t("immediate");

  return (
    <article className="flex w-[min(85vw,320px)] shrink-0 snap-start flex-col rounded-2xl border border-emerald-200 bg-white p-4 shadow-md shadow-emerald-100/50 sm:w-[300px]">
      <div className="mb-3 flex items-center gap-2">
        <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
          {availabilityLabel}
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-900">{candidate.name}</h3>
      <p className="mt-0.5 text-sm text-cyan-700">{candidate.role}</p>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
        {candidate.resort}, {candidate.country}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {candidate.languages.map((lang) => (
          <span
            key={lang}
            className="rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700"
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
        className="mt-3 w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        {t("contact")}
      </button>
    </article>
  );
}
