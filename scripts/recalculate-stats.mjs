/**
 * Recalculate estadisticas_en_vivo/global from real DB counts.
 * Run: npm run stats:recalculate
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  resolve("firebase/service-account.json");

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ Missing firebase/service-account.json");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))),
  });
}

const db = getFirestore();

const [ofertasSnap, candidatosSnap] = await Promise.all([
  db.collection("ofertas").where("activa", "==", true).get(),
  db
    .collection("usuarios")
    .where("rol", "==", "candidato")
    .where("disponibilidad_inmediata", "==", true)
    .get(),
]);

const countryCounts = new Map();
for (const doc of ofertasSnap.docs) {
  const pais = doc.data().pais;
  if (pais) countryCounts.set(pais, (countryCounts.get(pais) ?? 0) + 1);
}

const stats = {
  id: "global",
  ofertas_activas: ofertasSnap.size,
  candidatos_disponibles: candidatosSnap.size,
  paises_top_contratacion: [...countryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pais]) => pais),
  actualizado_en: Timestamp.now(),
};

await db.collection("estadisticas_en_vivo").doc("global").set(stats, { merge: true });

console.log("✓ Stats recalculated from live data:");
console.log(JSON.stringify(stats, null, 2));
