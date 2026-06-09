/**
 * Seed estadisticas_en_vivo/global (Admin SDK — bypasses client write rules).
 *
 * Setup:
 *   1. Firebase Console → Project settings → Service accounts → Generate new private key
 *   2. Save as firebase/service-account.json (already gitignored via .env* pattern — add explicit ignore)
 *   3. Run: npm run seed:stats
 *
 * Or set env: FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/service-account.json
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  resolve("firebase/service-account.json");

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`
❌ Service account not found at: ${SERVICE_ACCOUNT_PATH}

Steps:
  1. Firebase Console → ⚙️ Project settings → Service accounts
  2. "Generate new private key" → save as firebase/service-account.json
  3. Run again: npm run seed:stats
`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const statsDoc = {
  id: "global",
  ofertas_activas: 247,
  candidatos_disponibles: 1832,
  paises_top_contratacion: ["Switzerland", "France", "Austria"],
  actualizado_en: Timestamp.now(),
};

await db.collection("estadisticas_en_vivo").doc("global").set(statsDoc, { merge: true });

console.log("✓ estadisticas_en_vivo/global created/updated:");
console.log(JSON.stringify({ ...statsDoc, actualizado_en: "Timestamp.now()" }, null, 2));
