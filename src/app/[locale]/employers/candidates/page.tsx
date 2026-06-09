import { Navbar } from "@/components/home/Navbar";
import { EmployersCandidatesView } from "@/components/employers/EmployersCandidatesView";
import { SiteFooter } from "@/components/trust/SiteFooter";
import { getAvailableCandidates } from "@/lib/data/candidates";

export const revalidate = 60;

export default async function EmployersCandidatesPage() {
  const candidates = await getAvailableCandidates(48);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 text-slate-900">
      <Navbar />
      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <EmployersCandidatesView candidates={candidates} />
      </main>
      <SiteFooter />
    </div>
  );
}
