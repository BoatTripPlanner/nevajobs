/**
 * Ensures creator Firebase Auth account exists for alemv.mlg@gmail.com
 * Run: npm run seed:creator
 * Set CREATOR_PASSWORD env var or pass as first arg.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const CREATOR_EMAIL = process.env.NEVAJOBS_CREATOR_EMAIL ?? "alemv.mlg@gmail.com";
const CREATOR_PASSWORD = process.argv[2] ?? process.env.CREATOR_PASSWORD;

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  resolve("firebase/service-account.json");

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ Missing firebase/service-account.json");
  process.exit(1);
}

if (!CREATOR_PASSWORD || CREATOR_PASSWORD.length < 8) {
  console.error("❌ Set CREATOR_PASSWORD (min 8 chars) or: node scripts/seed-creator.mjs YourPassword");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"))),
  });
}

const auth = getAuth();
const db = getFirestore();
const now = Timestamp.now();

let uid;
try {
  const existing = await auth.getUserByEmail(CREATOR_EMAIL);
  uid = existing.uid;
  await auth.updateUser(uid, {
    password: CREATOR_PASSWORD,
    emailVerified: true,
    displayName: "Nevajobs Creator",
  });
  console.log(`✓ Updated auth user: ${CREATOR_EMAIL}`);
} catch (err) {
  if (err.code !== "auth/user-not-found") throw err;
  const created = await auth.createUser({
    email: CREATOR_EMAIL,
    password: CREATOR_PASSWORD,
    emailVerified: true,
    displayName: "Nevajobs Creator",
  });
  uid = created.uid;
  console.log(`✓ Created auth user: ${CREATOR_EMAIL}`);
}

await db.collection("usuarios").doc(uid).set(
  {
    uid,
    nombre: "Nevajobs Creator",
    email: CREATOR_EMAIL,
    rol: "empresa",
    es_premium: true,
    plan_empresa: "enterprise",
    creditos_disponibles: 100,
    idiomas_hablados: [],
    pais_origen: "Spain",
    disponibilidad_inmediata: false,
    permiso_trabajo_ue: true,
    valoracion_media: 0,
    perfil_completo: true,
    descripcion_empresa: "Nevajobs platform administration",
    categorias_contratacion: ["hoteles", "escuelas", "alquiler", "oficina"],
    updated_at: now,
    created_at: now,
  },
  { merge: true },
);

console.log(`✓ Firestore profile: usuarios/${uid}`);
console.log(`\n→ Login at /login with:`);
console.log(`  Email: ${CREATOR_EMAIL}`);
console.log(`  Password: (the one you provided)`);
console.log(`  → Redirects to /admin`);
