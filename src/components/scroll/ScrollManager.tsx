"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  parseHashHref,
  scrollToIdWhenReady,
  stripLocalePrefix,
  updateHash,
} from "@/lib/scroll/scroll";

export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) scrollToIdWhenReady(hash);
  }, [pathname]);

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) scrollToIdWhenReady(hash);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href*="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      let url: URL;
      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const hash = url.hash.replace(/^#/, "");
      if (!hash) return;

      const linkPath = stripLocalePrefix(url.pathname);
      const currentPath = stripLocalePrefix(window.location.pathname);

      if (linkPath !== currentPath) return;

      event.preventDefault();
      scrollToIdWhenReady(hash);
      updateHash(hash);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
