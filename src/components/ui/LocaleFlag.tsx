import type { ReactNode } from "react";

const localeToCountry: Record<string, string> = {
  en: "gb",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
};

/** Inline SVG flags — render consistently on Windows (emoji flags often show as "GB", "ES", etc.). */
const flags: Record<string, ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="h-3.5 w-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10" aria-hidden>
      <rect fill="#012169" width="60" height="30" />
      <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
      <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
      <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
    </svg>
  ),
  es: (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10" aria-hidden>
      <path fill="#AA151B" d="M0 0h60v10H0zm0 10h60v20H0zm0 20h60v10H0z" />
      <path fill="#F1BF00" d="M0 10h60v20H0z" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10" aria-hidden>
      <path fill="#002395" d="M0 0h20v40H0z" />
      <path fill="#fff" d="M20 0h20v40H20z" />
      <path fill="#ED2939" d="M40 0h20v40H40z" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10" aria-hidden>
      <path fill="#000" d="M0 0h60v13.3H0z" />
      <path fill="#DD0000" d="M0 13.3h60v13.4H0z" />
      <path fill="#FFCE00" d="M0 26.7h60V40H0z" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 60 40" className="h-3.5 w-5 shrink-0 rounded-sm shadow-sm ring-1 ring-black/10" aria-hidden>
      <path fill="#009246" d="M0 0h20v40H0z" />
      <path fill="#fff" d="M20 0h20v40H20z" />
      <path fill="#CE2B37" d="M40 0h20v40H40z" />
    </svg>
  ),
};

export function LocaleFlag({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const country = localeToCountry[locale] ?? locale;
  const flag = flags[country];

  if (!flag) {
    return (
      <span
        className={`inline-flex h-3.5 w-5 items-center justify-center rounded-sm bg-slate-200 text-[8px] font-bold uppercase text-slate-600 ${className ?? ""}`}
      >
        {locale.slice(0, 2)}
      </span>
    );
  }

  return <span className={`inline-flex ${className ?? ""}`}>{flag}</span>;
}

export function localeCountryCode(locale: string): string {
  return localeToCountry[locale] ?? locale;
}
