/**
 * Creates Firebase Auth test accounts + complete Firestore profiles for QA.
 * Run: npm run seed:test-auth
 *
 * Accounts:
 *   demo.empresa@nevajobs.test  / Nevajobs2025!
 *   demo.candidato@nevajobs.test / Nevajobs2025!
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  resolve("firebase/service-account.json");

const TEST_PASSWORD = "Nevajobs2025!";

const TEST_ACCOUNTS = [
  {
    email: "demo.empresa@nevajobs.test",
    displayName: "Alpine Staff Solutions",
    rol: "empresa",
    profile: {
      nombre: "Alpine Staff Solutions",
      pais_origen: "Switzerland",
      descripcion_empresa:
        "Private ski school and hotel staffing agency operating across the Swiss and French Alps.",
      categorias_contratacion: ["hoteles", "escuelas", "alquiler"],
      estaciones_operacion: ["Zermatt", "Verbier", "Chamonix"],
      sitio_web: "https://nevajobs.vercel.app",
      es_premium: true,
      creditos_disponibles: 10,
      plan_empresa: "pro",
    },
  },
  {
    email: "demo.candidato@nevajobs.test",
    displayName: "María García",
    rol: "candidato",
    profile: {
      nombre: "María García",
      pais_origen: "Spain",
      rol_buscado: "Ski Instructor",
      titulacion: "ESF Level 2",
      modalidad_principal: "ski",
      idiomas_hablados: ["ES", "EN", "FR"],
      estacion_actual: "Val d'Isère",
      en_estacion: true,
      disponibilidad_inmediata: true,
      permiso_trabajo_ue: true,
      valoracion_media: 4.6,
    },
  },
];

if (!existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ Missing firebase/service-account.json");
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

async function ensureAuthUser(email, displayName) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, {
      password: TEST_PASSWORD,
      displayName,
      emailVerified: true,
    });
    return existing.uid;
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    const created = await auth.createUser({
      email,
      password: TEST_PASSWORD,
      displayName,
      emailVerified: true,
    });
    return created.uid;
  }
}

console.log("→ Creating test auth accounts...\n");

for (const account of TEST_ACCOUNTS) {
  const uid = await ensureAuthUser(account.email, account.displayName);

  await db.collection("usuarios").doc(uid).set(
    {
      uid,
      email: account.email,
      rol: account.rol,
      es_premium: account.profile.es_premium ?? false,
      creditos_disponibles: account.profile.creditos_disponibles ?? 0,
      idiomas_hablados: account.profile.idiomas_hablados ?? [],
      disponibilidad_inmediata: account.profile.disponibilidad_inmediata ?? false,
      permiso_trabajo_ue: account.profile.permiso_trabajo_ue ?? false,
      valoracion_media: account.profile.valoracion_media ?? 0,
      perfil_completo: true,
      ...account.profile,
      updated_at: now,
      created_at: now,
    },
    { merge: true },
  );

  console.log(`✓ ${account.rol.padEnd(10)} ${account.email}`);
  console.log(`  uid: ${uid}`);
  console.log(`  password: ${TEST_PASSWORD}\n`);
}

// Seed a demo job for the empresa test account if missing
const empresaSnap = await db
  .collection("usuarios")
  .where("email", "==", "demo.empresa@nevajobs.test")
  .limit(1)
  .get();

if (!empresaSnap.empty) {
  const empresaId = empresaSnap.docs[0].id;
  await db.collection("ofertas").doc("test-oferta-instructor").set(
    {
      id: "test-oferta-instructor",
      titulo: "Ski Instructor — mid season",
      empresa_id: empresaId,
      nombre_empresa: "Alpine Staff Solutions",
      pais: "France",
      estacion: "Val d'Isère",
      categoria: "escuelas",
      modalidad: "ski",
      incluye_alojamiento: false,
      acepta_parejas: false,
      idiomas_requeridos: ["FR", "EN", "ES"],
      zona_economica: "UE",
      activa: true,
      fecha_publicacion: now,
      updated_at: now,
    },
    { merge: true },
  );
  console.log("✓ ofertas/test-oferta-instructor (for match testing)");
}

console.log("\n✓ Test accounts ready — log in at /login");
