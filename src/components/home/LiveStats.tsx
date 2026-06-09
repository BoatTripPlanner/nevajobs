import type { LucideIcon } from "lucide-react";
import { Globe2, Briefcase, Users } from "lucide-react";
import type { LiveStats as LiveStatsType } from "@/types/job";

interface LiveStatsProps {
  stats: LiveStatsType;
}

export function LiveStats({ stats }: LiveStatsProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="live-dot h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Live Stats
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <StatCard
              icon={Briefcase}
              label="Active jobs in the Alps & Pyrenees"
              value={stats.activeJobs.toLocaleString("en-GB")}
            />
            <StatCard
              icon={Users}
              label="Available candidates"
              value={stats.availableCandidates.toLocaleString("en-GB")}
            />
            <StatCard
              icon={Globe2}
              label="Top countries hiring"
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
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
      <Icon className="mb-3 h-5 w-5 text-cyan-400" />
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={`mt-1 font-semibold text-white ${isText ? "text-base leading-snug" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}
