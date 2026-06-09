/**
 * Push environment variables to Vercel (production, preview, development).
 * Run: npm run setup:vercel-env
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

function parseEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function addEnv(name, value, environments = ["production", "preview", "development"]) {
  for (const env of environments) {
    try {
      // --yes avoids interactive git-branch prompts on preview envs
      execSync(`npx vercel env add ${name} ${env} --force --yes`, {
        input: value,
        stdio: ["pipe", "inherit", "inherit"],
        shell: true,
      });
      console.log(`  ✓ ${name} → ${env}`);
    } catch {
      console.error(`  ✗ Failed: ${name} → ${env}`);
    }
  }
}

const root = resolve(".");
const localEnv = parseEnvFile(resolve(root, ".env.local"));
const saPath = resolve(root, "firebase/service-account.json");

if (!existsSync(saPath)) {
  console.error("❌ Missing firebase/service-account.json");
  process.exit(1);
}

const serviceAccount = readFileSync(saPath, "utf8");

console.log("→ Pushing env vars to Vercel (production, preview, development)...\n");

const keysFromLocal = Object.keys(localEnv).filter(
  (key) =>
    key.startsWith("NEXT_PUBLIC_") ||
    key.startsWith("STRIPE_") ||
    key === "NEVAJOBS_CREATOR_EMAIL" ||
    key === "CRON_SECRET" ||
    key === "RESEND_API_KEY" ||
    key === "ALERT_FROM_EMAIL",
);

for (const key of keysFromLocal) {
  addEnv(key, localEnv[key]);
}

addEnv("FIREBASE_SERVICE_ACCOUNT", serviceAccount);

if (!localEnv.NEVAJOBS_CREATOR_EMAIL) {
  addEnv("NEVAJOBS_CREATOR_EMAIL", "alemv.mlg@gmail.com");
}

if (!localEnv.CRON_SECRET) {
  console.log("\n  ℹ CRON_SECRET not in .env.local — left unchanged on Vercel");
}

console.log("\n✓ Done. Redeploy with: npx vercel --prod");
