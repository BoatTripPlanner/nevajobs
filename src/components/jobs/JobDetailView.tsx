import { Award, Home, Heart, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ofertaToJob } from "@/lib/data/ofertas";
import { categoriaFromFirestore } from "@/types/mappers";
import type { Oferta } from "@/types";

interface JobDetailViewProps {
  oferta: Oferta;
}

export async function JobDetailView({ oferta }: JobDetailViewProps) {
  const t = await getTranslations("jobs");
  const tDetail = await getTranslations("jobDetail");
  const job = ofertaToJob(oferta);
  const category = categoriaFromFirestore(oferta.categoria);

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <Link
        href="/jobs"
        className="text-sm font-medium text-cyan-600 transition hover:text-cyan-700"
      >
        ← {tDetail("backToJobs")}
      </Link>

      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {t(`categories.${category}`)}
        </span>
        {job.accommodationIncluded && (
          <span className="accommodation-badge rounded-full px-3 py-1 text-xs font-semibold">
            {t("accommodationBadge")}
          </span>
        )}
        {job.couplesWelcome && (
          <span className="couples-badge rounded-full px-3 py-1 text-xs font-semibold">
            {t("couplesBadge")}
          </span>
        )}
      </div>

      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
        {oferta.titulo}
      </h1>

      <p className="mt-3 flex items-center gap-2 text-slate-600">
        <MapPin className="h-4 w-4 shrink-0 text-cyan-600" />
        {oferta.estacion}, {oferta.pais}
      </p>

      {oferta.nombre_empresa && (
        <p className="mt-1 text-sm text-slate-500">{oferta.nombre_empresa}</p>
      )}

      {job.certificationRequired && (
        <p className="mt-4 flex items-center gap-2 text-sm text-amber-700">
          <Award className="h-4 w-4" />
          {t("certificationRequired")}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {job.languages.map((lang) => (
          <span
            key={lang}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
          >
            {lang}
          </span>
        ))}
      </div>

      {(oferta.incluye_alojamiento || oferta.acepta_parejas) && (
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
          {oferta.incluye_alojamiento && (
            <span className="inline-flex items-center gap-1.5">
              <Home className="h-4 w-4 text-cyan-600" />
              {t("accommodationBadge")}
            </span>
          )}
          {oferta.acepta_parejas && (
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-rose-500" />
              {t("couplesBadge")}
            </span>
          )}
        </div>
      )}

      {oferta.descripcion && (
        <section className="mt-8 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {tDetail("description")}
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 sm:text-base">
            {oferta.descripcion}
          </p>
        </section>
      )}

      {oferta.detalles_alojamiento && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {tDetail("accommodation")}
          </h2>
          <p className="mt-2 text-sm text-slate-700">{oferta.detalles_alojamiento}</p>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
        <Link
          href="/register?rol=candidato"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-sky-700"
        >
          {tDetail("applyCta")}
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          {tDetail("browseMore")}
        </Link>
      </div>
    </article>
  );
}
