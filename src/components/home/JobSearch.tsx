"use client";

import { useMemo, useState } from "react";
import { Home, Heart, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  europeanCountryKeys,
  privateCategoryKeys,
  requiredLanguageKeys,
  skiResortKeys,
  sportModalityKeys,
} from "@/lib/data/filter-keys";
import { scrollToIdWhenReady } from "@/lib/scroll/scroll";
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
  const t = useTranslations("search");
  const tFilters = useTranslations("filters");
  const [filters, setFilters] = useState<JobSearchFilters>(initialFilters);

  const countryOptions = useMemo(
    () =>
      europeanCountryKeys.map((key) => ({
        value: key,
        label: key ? tFilters(`countries.${key}`) : tFilters("allCountries"),
      })),
    [tFilters],
  );

  const resortOptions = useMemo(
    () =>
      skiResortKeys.map((key) => ({
        value: key,
        label: key ? tFilters(`resorts.${key}`) : tFilters("allResorts"),
      })),
    [tFilters],
  );

  const categoryOptions = useMemo(
    () =>
      privateCategoryKeys.map((key) => ({
        value: key,
        label: key ? tFilters(`categories.${key}`) : tFilters("allCategories"),
      })),
    [tFilters],
  );

  const languageOptions = useMemo(
    () =>
      requiredLanguageKeys.map((key) => ({
        value: key,
        label: key ? tFilters(`languages.${key}`) : tFilters("anyLanguage"),
      })),
    [tFilters],
  );

  const modalityOptions = useMemo(
    () =>
      sportModalityKeys.map((key) => ({
        value: key,
        label: key ? tFilters(`modalities.${key}`) : tFilters("anyModality"),
      })),
    [tFilters],
  );

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
    scrollToIdWhenReady("jobs");
  }

  return (
    <section id="search" className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/40 sm:p-8"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900 sm:mb-6 sm:text-lg">
            {t("title")}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label={t("country")}
              value={filters.country}
              onChange={(v) => updateFilter("country", v)}
              options={countryOptions}
            />
            <SelectField
              label={t("resort")}
              value={filters.resort}
              onChange={(v) => updateFilter("resort", v)}
              options={resortOptions}
            />
            <SelectField
              label={t("category")}
              value={filters.category}
              onChange={(v) => updateFilter("category", v)}
              options={categoryOptions}
            />
            <SelectField
              label={t("language")}
              value={filters.language}
              onChange={(v) => updateFilter("language", v)}
              options={languageOptions}
            />

            {showSportModality && (
              <SelectField
                label={t("modality")}
                value={filters.sportModality}
                onChange={(v) => updateFilter("sportModality", v)}
                options={modalityOptions}
              />
            )}

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <label className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-3 transition hover:border-cyan-300 hover:bg-cyan-100/60 sm:gap-3 sm:px-4">
                <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-cyan-800 sm:text-sm">
                  <Home className="h-4 w-4 shrink-0 text-cyan-600" />
                  <span className="leading-snug">{t("accommodation")}</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.accommodationIncluded}
                  onChange={(e) =>
                    updateFilter("accommodationIncluded", e.target.checked)
                  }
                  className="h-5 w-5 shrink-0 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500/30"
                />
              </label>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <label className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 transition hover:border-rose-300 hover:bg-rose-100/60 sm:gap-3 sm:px-4">
                <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-rose-800 sm:text-sm">
                  <Heart className="h-4 w-4 shrink-0 text-rose-500" />
                  <span className="leading-snug">{t("couples")}</span>
                </span>
                <input
                  type="checkbox"
                  checked={filters.couplesWelcome}
                  onChange={(e) =>
                    updateFilter("couplesWelcome", e.target.checked)
                  }
                  className="h-5 w-5 shrink-0 rounded border-rose-300 text-rose-500 focus:ring-rose-500/30"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-sky-700 sm:w-auto"
          >
            <Search className="h-4 w-4" />
            {t("submit")}
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
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 sm:px-4 sm:py-3 sm:text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value || "__all__"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
