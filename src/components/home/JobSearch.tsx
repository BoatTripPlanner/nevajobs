"use client";

import { useState } from "react";
import { Home, Heart, Search } from "lucide-react";
import {
  europeanCountries,
  skiResorts,
  privateCategories,
  requiredLanguages,
  sportModalities,
} from "@/lib/data/home-data";
import type { JobSearchFilters } from "@/types/job";

interface JobSearchProps {
  onSearch?: (filters: JobSearchFilters) => void;
}

const initialFilters: JobSearchFilters = {
  country: "",
  resort: "",
  category: "",
  language: "",
  sportModality: "",
  accommodationIncluded: false,
  couplesWelcome: false,
};

export function JobSearch({ onSearch }: JobSearchProps) {
  const [filters, setFilters] = useState<JobSearchFilters>(initialFilters);

  const showSportModality = filters.category === "schools";

  function updateFilter<K extends keyof JobSearchFilters>(
    key: K,
    value: JobSearchFilters[K],
  ) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "category" && value !== "schools") {
        next.sportModality = "";
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(filters);
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur sm:p-8"
        >
          <h2 className="mb-6 text-lg font-semibold text-white">
            Advanced job search
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Country"
              value={filters.country}
              onChange={(v) => updateFilter("country", v)}
              options={europeanCountries}
            />
            <SelectField
              label="Ski resort"
              value={filters.resort}
              onChange={(v) => updateFilter("resort", v)}
              options={skiResorts}
            />
            <SelectField
              label="Private category"
              value={filters.category}
              onChange={(v) => updateFilter("category", v)}
              options={privateCategories}
            />
            <SelectField
              label="Required language"
              value={filters.language}
              onChange={(v) => updateFilter("language", v)}
              options={requiredLanguages}
            />

            {showSportModality && (
              <SelectField
                label="Sport modality"
                value={filters.sportModality}
                onChange={(v) => updateFilter("sportModality", v)}
                options={sportModalities}
              />
            )}

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 transition hover:border-cyan-400/50">
                <span className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                  <Home className="h-4 w-4 shrink-0 text-cyan-300" />
                  <span>🏠 Accommodation included</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.accommodationIncluded}
                  onChange={(e) =>
                    updateFilter("accommodationIncluded", e.target.checked)
                  }
                  className="h-5 w-5 shrink-0 rounded border-cyan-400/50 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
              </label>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <label className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 transition hover:border-rose-400/50">
                <span className="flex items-center gap-2 text-sm font-medium text-rose-100">
                  <Heart className="h-4 w-4 shrink-0 text-rose-300" />
                  <span>🏠 Double accommodation / Couples welcome</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.couplesWelcome}
                  onChange={(e) =>
                    updateFilter("couplesWelcome", e.target.checked)
                  }
                  className="h-5 w-5 shrink-0 rounded border-rose-400/50 bg-slate-800 text-rose-500 focus:ring-rose-500/50"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-sky-500 sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Search jobs
          </button>
        </form>
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
