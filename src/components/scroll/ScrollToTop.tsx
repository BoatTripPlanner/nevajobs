"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { scrollToTop } from "@/lib/scroll/scroll";

const SHOW_AFTER_PX = 320;

export function ScrollToTop() {
  const t = useTranslations("a11y");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > SHOW_AFTER_PX);
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollToTop()}
      aria-label={t("scrollToTop")}
      title={t("scrollToTop")}
      className={`fixed right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-cyan-600 shadow-lg shadow-slate-300/30 backdrop-blur-sm transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-cyan-200/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 sm:right-6 sm:h-12 sm:w-12 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
      style={{
        bottom: "max(5.5rem, calc(1.25rem + env(safe-area-inset-bottom)))",
      }}
    >
      <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
    </button>
  );
}
