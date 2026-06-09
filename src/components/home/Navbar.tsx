"use client";

import { useState } from "react";
import { ChevronDown, LogIn, UserPlus } from "lucide-react";
import { supportedLocales } from "@/lib/data/home-data";

export function Navbar() {
  const [locale, setLocale] = useState(supportedLocales[0]);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/25">
            N
          </span>
          <span className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
              Neva
            </span>
            <span className="text-white">jobs</span>
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500/30 hover:bg-white/10"
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              <span>{locale.flag}</span>
              <span className="hidden sm:inline">{locale.label}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-900 py-1 shadow-xl"
              >
                {supportedLocales.map((item) => (
                  <li key={item.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={locale.code === item.code}
                      onClick={() => {
                        setLocale(item);
                        setLangOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-cyan-500/10 hover:text-white"
                    >
                      <span>{item.flag}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <a
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-white sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Login
          </a>
          <a
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-sky-500"
          >
            <UserPlus className="h-4 w-4" />
            Register
          </a>
        </div>
      </nav>
    </header>
  );
}
