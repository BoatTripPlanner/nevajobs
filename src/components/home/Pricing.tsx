import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function Pricing() {
  const t = await getTranslations("pricing");

  const freeFeatures = [
    { key: "post", included: true },
    { key: "browse", included: true },
    { key: "search", included: true },
    { key: "cv", included: false },
    { key: "chat", included: false },
    { key: "audio", included: false },
  ] as const;

  const premiumFeatures = [
    { key: "post", included: true },
    { key: "browse", included: true },
    { key: "search", included: true },
    { key: "cv", included: true },
    { key: "chat", included: true },
    { key: "audio", included: true },
  ] as const;

  return (
    <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="text-xl font-bold text-slate-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PricingCard
            name={t("free.name")}
            price={t("free.price")}
            period={t("free.period")}
            description={t("free.description")}
            features={freeFeatures.map((f) => ({
              label: t(`free.features.${f.key}`),
              included: f.included,
            }))}
            cta={t("free.cta")}
            ctaHref="/register?plan=free"
            highlighted={false}
            mostPopularLabel={t("mostPopular")}
          />
          <PricingCard
            name={t("premium.name")}
            price={t("premium.price")}
            period={t("premium.period")}
            description={t("premium.description")}
            features={premiumFeatures.map((f) => ({
              label: t(`premium.features.${f.key}`),
              included: f.included,
            }))}
            cta={t("premium.cta")}
            ctaHref="/billing/upgrade"
            highlighted
            mostPopularLabel={t("mostPopular")}
          />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">{t("footnote")}</p>
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
  mostPopularLabel,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { label: string; included: boolean }[];
  cta: string;
  ctaHref: string;
  highlighted: boolean;
  mostPopularLabel: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 sm:p-8 ${
        highlighted
          ? "border-cyan-300 bg-gradient-to-b from-cyan-50 to-white shadow-lg shadow-cyan-100"
          : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {highlighted && (
        <span className="mb-4 w-fit rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
          {mostPopularLabel}
        </span>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900 sm:text-4xl">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600">{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2.5 text-sm">
            {feature.included ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            )}
            <span
              className={
                feature.included ? "text-slate-700" : "text-slate-400"
              }
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition ${
          highlighted
            ? "bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-sky-700"
            : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
