export type JobCategory = "hotels" | "schools" | "rental" | "office";

export type SportModality = "ski" | "snowboard" | "both";

export interface Job {
  id: string;
  title: string;
  resort: string;
  country: string;
  category: JobCategory;
  languages: string[];
  accommodationIncluded: boolean;
  couplesWelcome?: boolean;
  certificationRequired?: boolean;
  companyName?: string;
  sportModality?: SportModality;
}

export interface LiveStats {
  activeJobs: number;
  availableCandidates: number;
  topCountries: string[];
}

export interface JobSearchFilters {
  country: string;
  resort: string;
  category: string;
  language: string;
  sportModality: string;
  accommodationIncluded: boolean;
  couplesWelcome: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  resort: string;
  country: string;
  languages: string[];
  immediateAvailability: boolean;
  inResort: boolean;
  voiceIntroUrl?: string;
  voiceIntroDuration?: number;
}
