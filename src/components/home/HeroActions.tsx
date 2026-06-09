"use client";

import { Briefcase, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollButton } from "@/components/scroll/ScrollButton";
import { ScrollLink } from "@/components/scroll/ScrollLink";

export function HeroActions() {
  const t = useTranslations("hero");

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
      <ScrollButton
        targetId="search"
        className="inline-flex w-full min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-sky-700 sm:w-auto"
      >
        <Briefcase className="h-4 w-4" />
        {t("ctaJobs")}
      </ScrollButton>
      <ScrollLink
        href="/#pricing"
        className="inline-flex w-full min-w-[200px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 sm:w-auto"
      >
        <Crown className="h-4 w-4" />
        {t("ctaPlans")}
      </ScrollLink>
    </div>
  );
}
