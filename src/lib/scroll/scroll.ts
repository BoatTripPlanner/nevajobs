import { routing, type Locale } from "@/i18n/routing";

export const SCROLL_OFFSET_FALLBACK = 72;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function getScrollOffset(): number {
  if (typeof document === "undefined") return SCROLL_OFFSET_FALLBACK;
  const root = document.querySelector<HTMLElement>("[data-scroll-offset-root]");
  if (root) return root.offsetHeight;
  const cssVar = getComputedStyle(document.documentElement).getPropertyValue(
    "--scroll-offset",
  );
  const parsed = parseFloat(cssVar);
  return Number.isFinite(parsed) ? parsed : SCROLL_OFFSET_FALLBACK;
}

export function parseHashHref(href: string): { path: string; hash: string | null } {
  const hashIdx = href.indexOf("#");
  if (hashIdx === -1) return { path: href || "/", hash: null };
  const path = href.slice(0, hashIdx) || "/";
  const hash = href.slice(hashIdx + 1);
  return { path, hash: hash || null };
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    routing.locales.includes(segments[0] as Locale)
  ) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

export function scrollToTop(behavior?: ScrollBehavior): void {
  if (typeof window === "undefined") return;
  window.scrollTo({
    top: 0,
    behavior: behavior ?? getScrollBehavior(),
  });
}

export function scrollToElement(
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; offset?: number },
): void {
  if (typeof window === "undefined") return;
  const offset = options?.offset ?? getScrollOffset();
  const behavior = options?.behavior ?? getScrollBehavior();
  const top = element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  });
}

export function scrollToId(
  id: string,
  options?: { behavior?: ScrollBehavior; offset?: number },
): boolean {
  const element = document.getElementById(id);
  if (!element) return false;
  scrollToElement(element, options);
  return true;
}

export function scrollToIdWhenReady(
  id: string,
  options?: { behavior?: ScrollBehavior; offset?: number; maxAttempts?: number },
): void {
  const maxAttempts = options?.maxAttempts ?? 30;
  let attempts = 0;

  const tryScroll = () => {
    if (scrollToId(id, options)) return;
    attempts += 1;
    if (attempts < maxAttempts) {
      requestAnimationFrame(tryScroll);
    }
  };

  requestAnimationFrame(tryScroll);
}

export function updateHash(id: string): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  window.history.replaceState(null, "", `${path}#${id}`);
}
