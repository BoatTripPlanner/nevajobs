import { Check, X } from "lucide-react";

const freeFeatures = [
  { label: "Post unlimited job listings", included: true },
  { label: "Browse candidate previews", included: true },
  { label: "Basic search & filters", included: true },
  { label: "Full candidate CV access", included: false },
  { label: "Direct chat with candidates", included: false },
  { label: "Audio introductions & ratings", included: false },
];

const premiumFeatures = [
  { label: "Post unlimited job listings", included: true },
  { label: "Browse candidate previews", included: true },
  { label: "Advanced search & filters", included: true },
  { label: "Full candidate CV access", included: true },
  { label: "Direct chat with candidates", included: true },
  { label: "Audio introductions & ratings", included: true },
];

export function Pricing() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Simple pricing for employers
          </h2>
          <p className="mt-2 text-slate-400">
            Candidates always join for free. Companies publish for free — unlock
            premium tools when you&apos;re ready to hire.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
            name="Free"
            price="€0"
            period="/ forever"
            description="List jobs and reach seasonal talent across Europe."
            features={freeFeatures}
            cta="Start posting free"
            ctaHref="/register?plan=free"
            highlighted={false}
          />
          <PricingCard
            name="Premium"
            price="€49"
            period="/ month"
            description="Unlock full profiles, chat and verified ratings."
            features={premiumFeatures}
            cta="Upgrade to Premium"
            ctaHref="/register?plan=premium"
            highlighted
          />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Seasonal billing available · Cancel anytime · Candidates never pay
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaHref,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-8 ${
        highlighted
          ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-slate-900/50 shadow-xl shadow-cyan-500/10"
          : "border-white/10 bg-slate-900/40"
      }`}
    >
      {highlighted && (
        <span className="mb-4 w-fit rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-white">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-slate-400">{period}</span>
      </div>
      <p className="mt-3 text-sm text-slate-400">{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2.5 text-sm">
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
            )}
            <span
              className={
                feature.included ? "text-slate-300" : "text-slate-600"
              }
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={ctaHref}
        className={`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
          highlighted
            ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-sky-500"
            : "border border-white/15 text-slate-200 hover:border-cyan-500/30 hover:bg-white/5"
        }`}
      >
        {cta}
      </a>
    </div>
  );
}
