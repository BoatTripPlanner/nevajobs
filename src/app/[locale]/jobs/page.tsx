import { Navbar } from "@/components/home/Navbar";
import { HomeJobsSection } from "@/components/home/HomeJobsSection";
import { SiteFooter } from "@/components/trust/SiteFooter";
import { getActiveOfertas } from "@/lib/data/ofertas-server";

export const revalidate = 60;

export default async function JobsPage() {
  const jobs = await getActiveOfertas(100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <Navbar />
      <main>
        <HomeJobsSection jobs={jobs} />
      </main>
      <SiteFooter />
    </div>
  );
}
