import { notFound } from "next/navigation";
import { Navbar } from "@/components/home/Navbar";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { SiteFooter } from "@/components/trust/SiteFooter";
import { getOfertaById } from "@/lib/data/ofertas";

export const revalidate = 60;

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const oferta = await getOfertaById(id);

  if (!oferta?.activa) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 text-slate-900">
      <Navbar />
      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <JobDetailView oferta={oferta} />
      </main>
      <SiteFooter />
    </div>
  );
}
