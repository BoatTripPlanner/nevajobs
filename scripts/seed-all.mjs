/**
 * Seeds ofertas + demo candidatos and recalculates live stats from real counts.
 * Run: npm run seed:all
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
const now = Timestamp.now();
const DEMO_EMPRESA_ID = "demo-empresa-nevajobs";

const ofertas = [
  {
    id: "oferta-zermatt-reception",
    titulo: "Hotel Receptionist",
    empresa_id: DEMO_EMPRESA_ID,
    nombre_empresa: "Alpine Lodge Zermatt",
    pais: "Switzerland",
    estacion: "Zermatt",
    categoria: "hoteles",
    incluye_alojamiento: true,
    acepta_parejas: true,
    detalles_alojamiento: "Staff house · double rooms for couples",
    idiomas_requeridos: ["EN", "DE"],
    zona_economica: "Suiza",
    activa: true,
    fecha_publicacion: now,
  },
  {
    id: "oferta-chamonix-instructor",
    titulo: "Ski & Snowboard Instructor",
    empresa_id: DEMO_EMPRESA_ID,
    nombre_empresa: "Chamonix Ski Academy",
    pais: "France",
    estacion: "Chamonix",
    categoria: "escuelas",
    modalidad: "both",
    incluye_alojamiento: false,
    acepta_parejas: false,
    idiomas_requeridos: ["FR", "EN"],
    zona_economica: "UE",
    activa: true,
    fecha_publicacion: now,
  },
  {
    id: "oferta-sierra-rental",
    titulo: "Ski Tech / Rental Agent",
    empresa_id: DEMO_EMPRESA_ID,
    nombre_empresa: "Summit Gear Rental",
    pais: "Spain",
    estacion: "Sierra Nevada",
    categoria: "alquiler",
    incluye_alojamiento: false,
    acepta_parejas: false,
    idiomas_requeridos: ["ES", "EN"],
    zona_economica: "UE",
    activa: true,
    fecha_publicacion: now,
  },
];

const demoCandidatos = [
  {
    uid: "demo-cand-lucas",
    nombre: "Lucas M.",
    email: "demo.lucas@nevajobs.internal",
    rol: "candidato",
    es_premium: false,
    creditos_disponibles: 0,
    titulacion: "ESF Level 2",
    modalidad_principal: "ski",
    rol_buscado: "Ski Instructor",
    idiomas_hablados: ["FR", "EN", "ES"],
    pais_origen: "France",
    estacion_actual: "Val d'Isère",
    en_estacion: true,
    disponibilidad_inmediata: true,
    permiso_trabajo_ue: true,
    valoracion_media: 4.7,
  },
  {
    uid: "demo-cand-couple",
    nombre: "Emma & Tom K.",
    email: "demo.couple@nevajobs.internal",
    rol: "candidato",
    es_premium: false,
    creditos_disponibles: 0,
    rol_buscado: "Hotel Couple · F&B & Reception",
    idiomas_hablados: ["EN", "DE"],
    pais_origen: "Austria",
    estacion_actual: "St. Anton",
    en_estacion: true,
    disponibilidad_inmediata: true,
    permiso_trabajo_ue: true,
    valoracion_media: 4.5,
  },
  {
    uid: "demo-cand-sofia",
    nombre: "Sofia R.",
    email: "demo.sofia@nevajobs.internal",
    rol: "candidato",
    es_premium: false,
    creditos_disponibles: 0,
    rol_buscado: "Rental Technician",
    idiomas_hablados: ["ES", "EN", "IT"],
    pais_origen: "Spain",
    estacion_actual: "Sierra Nevada",
    en_estacion: false,
    disponibilidad_inmediata: true,
    permiso_trabajo_ue: true,
    valoracion_media: 4.2,
  },
];

console.log("→ Seeding ofertas...");
for (const oferta of ofertas) {
  const { id, ...data } = oferta;
  await db.collection("ofertas").doc(id).set({ id, ...data, updated_at: now }, { merge: true });
  console.log(`  ✓ ofertas/${id}`);
}

console.log("→ Seeding demo empresa profile...");
await db.collection("usuarios").doc(DEMO_EMPRESA_ID).set(
  {
    uid: DEMO_EMPRESA_ID,
    nombre: "Nevajobs Demo Employer",
    email: "demo.employer@nevajobs.internal",
    rol: "empresa",
    es_premium: true,
    creditos_disponibles: 10,
    idiomas_hablados: [],
    pais_origen: "Switzerland",
    disponibilidad_inmediata: false,
    permiso_trabajo_ue: true,
    valoracion_media: 0,
    updated_at: now,
  },
  { merge: true },
);

console.log("→ Seeding demo candidatos...");
for (const cand of demoCandidatos) {
  const { uid, ...data } = cand;
  await db.collection("usuarios").doc(uid).set({ uid, ...data, updated_at: now }, { merge: true });
  console.log(`  ✓ usuarios/${uid}`);
}

console.log("→ Recalculating estadisticas_en_vivo/global...");
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
  countryCounts.set(pais, (countryCounts.get(pais) ?? 0) + 1);
}
const topCountries = [...countryCounts.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([pais]) => pais);

const stats = {
  id: "global",
  ofertas_activas: ofertasSnap.size,
  candidatos_disponibles: candidatosSnap.size,
  paises_top_contratacion: topCountries,
  actualizado_en: now,
};

await db.collection("estadisticas_en_vivo").doc("global").set(stats, { merge: true });

console.log("\n✓ Seed complete — live stats (automated from DB):");
console.log(JSON.stringify(stats, null, 2));
