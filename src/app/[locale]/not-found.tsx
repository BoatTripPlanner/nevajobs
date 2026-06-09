import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600 sm:text-base">
        {t("description")}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-sky-700"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/jobs"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          {t("browseJobs")}
        </Link>
      </div>
    </div>
  );
}
