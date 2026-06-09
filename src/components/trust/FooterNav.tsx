"use client";

import { useTranslations } from "next-intl";
import { ScrollLink } from "@/components/scroll/ScrollLink";

export function FooterNav() {
  const t = useTranslations("footer");

  const links = [
    { href: "/#search", label: t("linkJobs") },
    { href: "/#candidates", label: t("linkCandidates") },
    { href: "/#pricing", label: t("linkPricing") },
  ] as const;

  return (
    <nav
      aria-label={t("navLabel")}
      className="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
    >
      {links.map((link) => (
        <ScrollLink
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-slate-600 transition hover:text-cyan-700"
        >
          {link.label}
        </ScrollLink>
      ))}
    </nav>
  );
}
