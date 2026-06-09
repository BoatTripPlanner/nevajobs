import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadServiceAccount(): Record<string, unknown> {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonEnv) {
    return JSON.parse(jsonEnv) as Record<string, unknown>;
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    resolve("firebase/service-account.json");

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT (Vercel) or firebase/service-account.json (local).",
    );
  }

  return JSON.parse(readFileSync(serviceAccountPath, "utf8")) as Record<
    string,
    unknown
  >;
}

function initAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  return initializeApp({ credential: cert(loadServiceAccount()) });
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}
