import "server-only";
import { getStripe } from "@/lib/stripe";

export interface StripeChargeRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  description: string | null;
  customerEmail: string | null;
}

export interface StripeRevenueData {
  currency: string;
  balanceAvailable: number;
  balancePending: number;
  mrrCents: number;
  activeSubscriptions: number;
  last30DaysRevenueCents: number;
  recentCharges: StripeChargeRow[];
}

function subscriptionMrrCents(
  items: Array<{
    price?: {
      unit_amount: number | null;
      recurring?: { interval: string; interval_count?: number } | null;
    } | null;
    quantity?: number | null;
  }>,
): number {
  let mrr = 0;
  for (const item of items) {
    const amount = item.price?.unit_amount;
    if (!amount) continue;
    const qty = item.quantity ?? 1;
    const interval = item.price?.recurring?.interval;
    const intervalCount = item.price?.recurring?.interval_count ?? 1;
    if (interval === "month") {
      mrr += Math.round((amount * qty) / intervalCount);
    } else if (interval === "year") {
      mrr += Math.round((amount * qty) / (12 * intervalCount));
    }
  }
  return mrr;
}

export async function fetchStripeRevenueData(): Promise<StripeRevenueData> {
  const stripe = getStripe();
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;

  const [balance, charges, subscriptions] = await Promise.all([
    stripe.balance.retrieve(),
    stripe.charges.list({ limit: 25, created: { gte: thirtyDaysAgo } }),
    stripe.subscriptions.list({ status: "active", limit: 100 }),
  ]);

  const eurAvailable =
    balance.available.find((b) => b.currency === "eur")?.amount ?? 0;
  const eurPending =
    balance.pending.find((b) => b.currency === "eur")?.amount ?? 0;

  let mrrCents = 0;
  for (const sub of subscriptions.data) {
    mrrCents += subscriptionMrrCents(sub.items.data);
  }

  const succeededCharges = charges.data.filter((c) => c.status === "succeeded");
  const last30DaysRevenueCents = succeededCharges.reduce(
    (sum, c) => sum + c.amount,
    0,
  );

  const recentCharges: StripeChargeRow[] = charges.data
    .slice(0, 15)
    .map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      created: new Date(charge.created * 1000).toISOString(),
      description: charge.description,
      customerEmail:
        typeof charge.billing_details?.email === "string"
          ? charge.billing_details.email
          : null,
    }));

  return {
    currency: "eur",
    balanceAvailable: eurAvailable,
    balancePending: eurPending,
    mrrCents,
    activeSubscriptions: subscriptions.data.length,
    last30DaysRevenueCents,
    recentCharges,
  };
}
