import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { LiveStats } from "@/components/home/LiveStats";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { AvailableCandidates } from "@/components/home/AvailableCandidates";
import { Pricing } from "@/components/home/Pricing";
import { getLiveStatsFresh } from "@/lib/data/live-stats-server";
import { getActiveOfertas } from "@/lib/data/ofertas";
import { getAvailableCandidates } from "@/lib/data/candidates";

export const revalidate = 60;

export default async function HomePage() {
  const t = await getTranslations("footer");
  const [stats, jobs, candidates] = await Promise.all([
    getLiveStatsFresh(15),
    getActiveOfertas(),
    getAvailableCandidates(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <TrustSection />
        <LiveStats stats={stats} />
        <HomeJobsSection jobs={jobs} />
        <AvailableCandidates candidates={candidates} />
        <Pricing />
      </main>
      <footer className="safe-bottom border-t border-slate-200 bg-white/60 px-4 py-6 text-center text-xs text-slate-500 sm:px-6 sm:py-8 sm:text-sm lg:px-8">
        {t("copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
