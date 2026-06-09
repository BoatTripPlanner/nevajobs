import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { LiveStats } from "@/components/home/LiveStats";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { AvailableCandidates } from "@/components/home/AvailableCandidates";
import { Pricing } from "@/components/home/Pricing";
import { getLiveStatsFresh } from "@/lib/data/live-stats-server";
import { getActiveOfertas } from "@/lib/data/ofertas";
import { getAvailableCandidates } from "@/lib/data/candidates";

export const revalidate = 60;

export default async function HomePage() {
  const [stats, jobs, candidates] = await Promise.all([
    getLiveStatsFresh(15),
    getActiveOfertas(),
    getAvailableCandidates(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main>
        <Hero />
        <LiveStats stats={stats} />
        <HomeJobsSection jobs={jobs} />
        <AvailableCandidates candidates={candidates} />
        <Pricing />
      </main>
      <footer className="border-t border-white/5 px-4 py-8 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Nevajobs — Premium winter jobs across Europe
      </footer>
    </div>
  );
}
