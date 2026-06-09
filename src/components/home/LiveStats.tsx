"use client";

import type { LucideIcon } from "lucide-react";
import { Globe2, Briefcase, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LiveStats as LiveStatsType } from "@/types/job";

interface LiveStatsProps {
  stats: LiveStatsType;
}

export function LiveStats({ stats }: LiveStatsProps) {
  const t = useTranslations("stats");

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/50 sm:p-8">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <span className="live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {t("live")}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
            <StatCard
              icon={Briefcase}
              label={t("activeJobs")}
              value={stats.activeJobs.toLocaleString()}
            />
            <StatCard
              icon={Users}
              label={t("availableCandidates")}
              value={stats.availableCandidates.toLocaleString()}
            />
            <StatCard
              icon={Globe2}
              label={t("topCountries")}
              value={stats.topCountries.join(" · ")}
              isText
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isText = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-sky-50/50 p-4 sm:p-5">
      <Icon className="mb-2 h-5 w-5 text-cyan-600 sm:mb-3" />
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p
        className={`mt-0.5 font-semibold text-slate-900 sm:mt-1 ${isText ? "line-clamp-2 text-sm leading-snug sm:text-base" : "text-xl sm:text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
