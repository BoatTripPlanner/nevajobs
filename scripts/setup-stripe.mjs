/**
 * Verifies Stripe config and ensures a production webhook endpoint exists.
 * Run: node scripts/setup-stripe.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import Stripe from "stripe";

const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
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

function upsertEnvVar(envPath, content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

async function main() {
  const { path: envPath, vars } = loadEnv();
  const secretKey = vars.STRIPE_SECRET_KEY;
  const priceId = vars.STRIPE_PREMIUM_PRICE_ID;
  const appUrl = vars.NEXT_PUBLIC_APP_URL ?? "https://nevajobs.vercel.app";
  const webhookUrl = `${appUrl.replace(/\/$/, "")}/api/stripe/webhook`;

  if (!secretKey?.startsWith("sk_")) {
    console.error("❌ STRIPE_SECRET_KEY missing or invalid in .env.local");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  let content = readFileSync(envPath, "utf8");

  console.log("→ Stripe account");
  const account = await stripe.accounts.retrieve();
  console.log(`  ✓ ${account.settings?.dashboard?.display_name ?? account.id}`);

  if (priceId) {
    const price = await stripe.prices.retrieve(priceId);
    const product =
      typeof price.product === "string"
        ? await stripe.products.retrieve(price.product)
        : price.product;
    console.log(`  ✓ Product: ${product.name}`);
    console.log(
      `  ✓ Price: €${(price.unit_amount ?? 0) / 100}/${price.recurring?.interval ?? "once"}`,
    );
  }

  console.log("\n→ Webhook endpoint");
  const existing = await stripe.webhookEndpoints.list({ limit: 100 });
  let endpoint = existing.data.find((item) => item.url === webhookUrl);

  if (!endpoint) {
    endpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: WEBHOOK_EVENTS,
      description: "Nevajobs Premium subscription sync",
    });
    console.log(`  ✓ Created webhook → ${webhookUrl}`);
  } else {
    endpoint = await stripe.webhookEndpoints.update(endpoint.id, {
      enabled_events: WEBHOOK_EVENTS,
      disabled: false,
    });
    console.log(`  ✓ Webhook already exists → ${webhookUrl}`);
  }

  content = upsertEnvVar(envPath, content, "STRIPE_WEBHOOK_SECRET", endpoint.secret);
  writeFileSync(envPath, content, "utf8");
  console.log("  ✓ STRIPE_WEBHOOK_SECRET saved to .env.local");

  console.log("\n✓ Stripe configured for Nevajobs Premium");
  console.log(`  Webhook events: ${WEBHOOK_EVENTS.join(", ")}`);
}

main().catch((error) => {
  console.error("❌", error.message ?? error);
  process.exit(1);
});
