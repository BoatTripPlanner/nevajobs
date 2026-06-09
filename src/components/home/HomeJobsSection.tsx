"use client";

import { useMemo, useState } from "react";
import { JobSearch } from "@/components/home/JobSearch";
import { JobListings } from "@/components/home/JobListings";
import { filterJobs } from "@/lib/data/filter-jobs";
import type { Job, JobSearchFilters } from "@/types/job";

interface HomeJobsSectionProps {
  jobs: Job[];
}

export function HomeJobsSection({ jobs }: HomeJobsSectionProps) {
  const [filters, setFilters] = useState<JobSearchFilters | null>(null);

  const displayedJobs = useMemo(() => {
    if (!filters) return jobs;
    return filterJobs(jobs, filters);
  }, [jobs, filters]);

  return (
    <>
      <JobSearch onSearch={setFilters} />
      <JobListings jobs={displayedJobs} />
    </>
  );
}
