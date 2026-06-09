import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, getMetadata } from "firebase/storage";

function loadEnv() {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
}

loadEnv();

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const results = [];

function ok(service, detail) {
  results.push({ service, status: "OK", detail });
}

function warn(service, detail) {
  results.push({ service, status: "WARN", detail });
}

function fail(service, detail) {
  results.push({ service, status: "FAIL", detail });
}

for (const key of required) {
  if (!process.env[key]) {
    fail("Env", `Falta ${key}`);
  }
}

if (results.some((r) => r.status === "FAIL")) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(1);
}

ok("Env", "Las 6 variables NEXT_PUBLIC_FIREBASE_* están definidas");

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

ok("SDK", `Firebase inicializado para proyecto "${config.projectId}"`);

try {
  const methods = await fetchSignInMethodsForEmail(auth, "verify@nevajobs.test");
  ok(
    "Authentication",
    methods.length
      ? `Proveedores activos detectados: ${methods.join(", ")}`
      : "Servicio accesible (email de prueba sin métodos registrados)",
  );
} catch (error) {
  const code = error?.code ?? "unknown";
  if (code === "auth/invalid-api-key" || code === "auth/configuration-not-found") {
    fail("Authentication", `${code}: revisa apiKey y authDomain`);
  } else {
    warn("Authentication", `${code}: ${error.message}`);
  }
}

try {
  await getDoc(doc(db, "_healthcheck", "probe"));
  warn(
    "Firestore",
    "Lectura permitida sin autenticación — parece modo test, no producción estricta",
  );
} catch (error) {
  const code = error?.code ?? "";
  if (code === "permission-denied") {
    ok(
      "Firestore",
      "Base de datos activa con reglas restrictivas (modo producción)",
    );
  } else if (code === "not-found" || code === "unavailable") {
    fail("Firestore", `${code}: ${error.message}`);
  } else {
    warn("Firestore", `${code || "error"}: ${error.message}`);
  }
}

try {
  await getMetadata(ref(storage, "_healthcheck/probe.txt"));
  warn(
    "Storage",
    "Lectura permitida sin autenticación — reglas más abiertas de lo esperado",
  );
} catch (error) {
  const code = error?.code ?? "";
  if (code === "storage/unauthorized" || code === "storage/object-not-found") {
    ok(
      "Storage",
      code === "storage/unauthorized"
        ? "Bucket activo con reglas restrictivas (modo producción)"
        : "Bucket activo; objeto inexistente pero servicio responde",
    );
  } else if (code === "storage/unknown" || code === "storage/retry-limit-exceeded") {
    fail("Storage", `${code}: ${error.message}`);
  } else {
    warn("Storage", `${code || "error"}: ${error.message}`);
  }
}

console.log(JSON.stringify(results, null, 2));

if (results.some((r) => r.status === "FAIL")) {
  process.exit(1);
}
