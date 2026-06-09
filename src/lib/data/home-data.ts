import type { Job, LiveStats, Candidate } from "@/types/job";

/** Fallback when Firestore is unavailable (dev / offline). */
export const liveStats: LiveStats = {
  activeJobs: 247,
  availableCandidates: 1832,
  topCountries: ["Switzerland", "France", "Austria"],
};

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Hotel Receptionist",
    resort: "Zermatt",
    country: "Switzerland",
    category: "hotels",
    languages: ["EN", "DE"],
    accommodationIncluded: true,
    couplesWelcome: true,
    companyName: "Alpine Lodge Zermatt",
  },
  {
    id: "job-2",
    title: "Ski & Snowboard Instructor",
    resort: "Chamonix",
    country: "France",
    category: "schools",
    languages: ["FR", "EN"],
    accommodationIncluded: false,
    certificationRequired: true,
    sportModality: "both",
    companyName: "Chamonix Ski Academy",
  },
  {
    id: "job-3",
    title: "Ski Tech / Rental Agent",
    resort: "Sierra Nevada",
    country: "Spain",
    category: "rental",
    languages: ["ES", "EN"],
    accommodationIncluded: false,
    companyName: "Summit Gear Rental",
  },
];

/** Replace with Firestore `candidates` collection (employer feed). */
export const mockCandidates: Candidate[] = [
  {
    id: "cand-1",
    name: "Lucas M.",
    role: "Ski Instructor",
    resort: "Val d'Isère",
    country: "France",
    languages: ["FR", "EN", "ES"],
    immediateAvailability: true,
    inResort: true,
    voiceIntroDuration: 30,
  },
  {
    id: "cand-2",
    name: "Emma & Tom K.",
    role: "Hotel Couple · F&B & Reception",
    resort: "St. Anton",
    country: "Austria",
    languages: ["EN", "DE"],
    immediateAvailability: true,
    inResort: true,
    voiceIntroDuration: 30,
  },
  {
    id: "cand-3",
    name: "Sofia R.",
    role: "Rental Technician",
    resort: "Sierra Nevada",
    country: "Spain",
    languages: ["ES", "EN", "IT"],
    immediateAvailability: true,
    inResort: false,
    voiceIntroDuration: 30,
  },
];

export const europeanCountries = [
  { value: "", label: "All countries" },
  { value: "switzerland", label: "Switzerland" },
  { value: "france", label: "France" },
  { value: "austria", label: "Austria" },
  { value: "italy", label: "Italy" },
  { value: "spain", label: "Spain" },
  { value: "andorra", label: "Andorra" },
  { value: "germany", label: "Germany" },
];

export const skiResorts = [
  { value: "", label: "All resorts" },
  { value: "zermatt", label: "Zermatt" },
  { value: "chamonix", label: "Chamonix" },
  { value: "verbier", label: "Verbier" },
  { value: "sierra-nevada", label: "Sierra Nevada" },
  { value: "st-anton", label: "St. Anton" },
  { value: "cortina", label: "Cortina d'Ampezzo" },
  { value: "val-disere", label: "Val d'Isère" },
];

export const privateCategories = [
  { value: "", label: "All categories" },
  { value: "hotels", label: "Hotels & Hospitality" },
  { value: "schools", label: "Ski Schools & Clubs" },
  { value: "rental", label: "Shops & Equipment Rental" },
  { value: "office", label: "Office & Local Management" },
];

export const requiredLanguages = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "it", label: "Italian" },
];

export const sportModalities = [
  { value: "", label: "Any modality" },
  { value: "ski", label: "Ski" },
  { value: "snowboard", label: "Snowboard" },
  { value: "both", label: "Ski & Snowboard" },
];

export const supportedLocales = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];
