/**
 * Creates Nevajobs B2B Stripe products & prices, writes IDs to .env.local
 * Run: npm run setup:stripe-plans
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const PLANS = [
  {
    productKey: "starter",
    name: "Nevajobs Starter",
    description: "Small shops & station bars — 10 unlocks/month, less than a dinner out",
    prices: [
      { envKey: "STRIPE_PRICE_STARTER_MONTHLY", amount: 3900, recurring: "month" },
      { envKey: "STRIPE_PRICE_STARTER_SEASON", amount: 17500, recurring: null },
    ],
  },
  {
    productKey: "pro",
    name: "Nevajobs Pro",
    description: "Hotels & restaurants — unlimited unlocks + Emergency Radar",
    prices: [
      { envKey: "STRIPE_PRICE_PRO_MONTHLY", amount: 7900, recurring: "month" },
      { envKey: "STRIPE_PRICE_PRO_SEASON", amount: 35000, recurring: null },
    ],
  },
  {
    productKey: "enterprise",
    name: "Nevajobs Enterprise",
    description: "Hotel chains & luxury resorts — featured offers + priority support",
    prices: [
      { envKey: "STRIPE_PRICE_ENTERPRISE_MONTHLY", amount: 14900, recurring: "month" },
    ],
  },
  {
    productKey: "credit",
    name: "Nevajobs Candidate Credit",
    description: "1 credit = unlock 1 candidate (CV, voice intro, chat) — €5",
    prices: [
      { envKey: "STRIPE_PRICE_CREDIT", amount: 500, recurring: null },
    ],
  },
];

function loadEnv() {
  const path = resolve(".env.local");
  if (!existsSync(path)) {
    console.error("❌ Missing .env.local");
    process.exit(1);
  }

  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return { path, vars };
}

function upsertEnvVar(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

async function findProductByKey(stripe, productKey) {
  const products = await stripe.products.list({ limit: 100, active: true });
  return products.data.find((p) => p.metadata?.nevajobs_plan === productKey) ?? null;
}

async function findPriceForProduct(stripe, productId, amount, recurring) {
  const prices = await stripe.prices.list({ product: productId, limit: 100, active: true });
  return (
    prices.data.find(
      (p) =>
        p.unit_amount === amount
        && (recurring
          ? p.recurring?.interval === recurring
          : !p.recurring),
    ) ?? null
  );
}

async function main() {
  const { path: envPath, vars } = loadEnv();
  const secretKey = vars.STRIPE_SECRET_KEY;

  if (!secretKey?.startsWith("sk_")) {
    console.error("❌ STRIPE_SECRET_KEY missing or invalid in .env.local");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  let content = readFileSync(envPath, "utf8");

  console.log("→ Creating Nevajobs B2B products & prices\n");

  const account = await stripe.accounts.retrieve();
  console.log(`  Account: ${account.settings?.dashboard?.display_name ?? account.id}\n`);

  for (const plan of PLANS) {
    let product = await findProductByKey(stripe, plan.productKey);

    if (!product) {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { nevajobs_plan: plan.productKey },
      });
      console.log(`✓ Created product: ${plan.name}`);
    } else {
      console.log(`✓ Product exists: ${plan.name}`);
    }

    for (const priceDef of plan.prices) {
      let price = await findPriceForProduct(
        stripe,
        product.id,
        priceDef.amount,
        priceDef.recurring,
      );

      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          currency: "eur",
          unit_amount: priceDef.amount,
          ...(priceDef.recurring
            ? { recurring: { interval: priceDef.recurring } }
            : {}),
          metadata: { nevajobs_plan: plan.productKey },
        });
        const label = priceDef.recurring
          ? `€${priceDef.amount / 100}/${priceDef.recurring}`
          : `€${priceDef.amount / 100} once`;
        console.log(`  ✓ Created price: ${label} → ${price.id}`);
      } else {
        console.log(`  ✓ Price exists: ${price.id}`);
      }

      content = upsertEnvVar(content, priceDef.envKey, price.id);

      if (priceDef.envKey === "STRIPE_PRICE_PRO_MONTHLY") {
        content = upsertEnvVar(content, "STRIPE_PREMIUM_PRICE_ID", price.id);
      }
    }
  }

  writeFileSync(envPath, content, "utf8");
  console.log("\n✓ All price IDs saved to .env.local");
  console.log("  Run scripts/setup-vercel-env.mjs to sync to Vercel if needed.");
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
