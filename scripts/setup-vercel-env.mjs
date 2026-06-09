/**
 * Push environment variables to Vercel (production, preview, development).
 * Run once after linking: node scripts/setup-vercel-env.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
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
      execSync(`vercel env add ${name} ${env} --force`, {
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

console.log("→ Pushing env vars to Vercel...\n");

for (const [key, value] of Object.entries(localEnv)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    addEnv(key, value);
  }
}

addEnv("FIREBASE_SERVICE_ACCOUNT", serviceAccount);
addEnv("CRON_SECRET", randomUUID());

console.log("\n✓ Done. Redeploy with: vercel --prod");
