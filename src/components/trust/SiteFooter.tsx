import { getTranslations } from "next-intl/server";
import { FooterNav } from "@/components/trust/FooterNav";
import { TrustBadges } from "@/components/trust/TrustBadges";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="safe-bottom border-t border-slate-200 bg-white/80 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <FooterNav />
        <TrustBadges
          variant="strip"
          badges={["stripe", "ssl", "gdpr", "guarantee", "transparent"]}
          className="mb-6"
        />
        <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          {t("trustLine")}
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
