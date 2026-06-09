import type { ReactNode } from "react";

const localeToCountry: Record<string, string> = {
  en: "gb",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
};

function FlagSvg({
  viewBox,
  children,
}: {
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className="block size-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const flagContent: Record<string, { viewBox: string; node: ReactNode }> = {
  gb: {
    viewBox: "0 0 60 30",
    node: (
      <>
        <rect fill="#012169" width="60" height="30" />
        <path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
        <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
        <path stroke="#fff" strokeWidth="10" d="M30 0v30M0 15h60" />
        <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
      </>
    ),
  },
  es: {
    viewBox: "0 0 60 40",
    node: (
      <>
        <rect fill="#AA151B" width="60" height="40" />
        <rect fill="#F1BF00" y="10" width="60" height="20" />
      </>
    ),
  },
  fr: {
    viewBox: "0 0 60 40",
    node: (
      <>
        <rect fill="#002395" width="20" height="40" />
        <rect fill="#fff" x="20" width="20" height="40" />
        <rect fill="#ED2939" x="40" width="20" height="40" />
      </>
    ),
  },
  de: {
    viewBox: "0 0 60 40",
    node: (
      <>
        <rect fill="#000" width="60" height="13.34" />
        <rect fill="#DD0000" y="13.34" width="60" height="13.33" />
        <rect fill="#FFCE00" y="26.67" width="60" height="13.33" />
      </>
    ),
  },
  it: {
    viewBox: "0 0 60 40",
    node: (
      <>
        <rect fill="#009246" width="20" height="40" />
        <rect fill="#fff" x="20" width="20" height="40" />
        <rect fill="#CE2B37" x="40" width="20" height="40" />
      </>
    ),
  },
};

export function LocaleFlag({
  locale,
  className = "h-5 w-7 sm:h-4 sm:w-6",
}: {
  locale: string;
  className?: string;
}) {
  const country = localeToCountry[locale] ?? locale;
  const flag = flagContent[country];

  if (!flag) {
    return (
      <span
        className={`inline-flex items-center justify-center overflow-hidden rounded-[3px] bg-slate-200 text-[9px] font-bold uppercase text-slate-600 ring-1 ring-black/10 ${className}`}
      >
        {locale.slice(0, 2)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/10 ${className}`}
    >
      <FlagSvg viewBox={flag.viewBox}>{flag.node}</FlagSvg>
    </span>
  );
}

export function localeCountryCode(locale: string): string {
  return localeToCountry[locale] ?? locale;
}
