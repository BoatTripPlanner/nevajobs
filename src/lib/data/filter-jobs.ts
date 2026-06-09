import type { Job, JobSearchFilters } from "@/types/job";
import { slugify } from "@/lib/utils/slugify";

function matchesCountry(job: Job, country: string): boolean {
  if (!country) return true;
  return slugify(job.country) === country;
}

function matchesResort(job: Job, resort: string): boolean {
  if (!resort) return true;
  return slugify(job.resort) === resort;
}

function matchesCategory(job: Job, category: string): boolean {
  if (!category) return true;
  return job.category === category;
}

function matchesLanguage(job: Job, language: string): boolean {
  if (!language) return true;
  const code = language.toUpperCase();
  return job.languages.some((l) => l.toUpperCase() === code);
}

function matchesSportModality(job: Job, modality: string): boolean {
  if (!modality) return true;
  return job.sportModality === modality;
}

export function filterJobs(jobs: Job[], filters: JobSearchFilters): Job[] {
  return jobs.filter(
    (job) =>
      matchesCountry(job, filters.country) &&
      matchesResort(job, filters.resort) &&
      matchesCategory(job, filters.category) &&
      matchesLanguage(job, filters.language) &&
      matchesSportModality(job, filters.sportModality) &&
      (!filters.accommodationIncluded || job.accommodationIncluded) &&
      (!filters.couplesWelcome || job.couplesWelcome),
  );
}
