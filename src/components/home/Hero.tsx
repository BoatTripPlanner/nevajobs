import { useTranslations } from "next-intl";
import { HeroActions } from "@/components/home/HeroActions";
import { TrustBadges } from "@/components/trust/TrustBadges";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/80 via-white to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-cyan-700">
          {t("badge")}
        </p>
        <h1 className="text-[1.75rem] font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          {t("titleBefore")}{" "}
          <span className="bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>{" "}
          {t("titleAfter")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-xl">
          {t("subtitle")}
        </p>
        <HeroActions />
        <TrustBadges
          variant="strip"
          badges={["stripe", "gdpr", "verified", "europe"]}
          className="mx-auto mt-8 max-w-3xl"
        />
      </div>
    </section>
  );
}
