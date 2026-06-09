import "server-only";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function normalizeServiceAccount(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const account = { ...raw };
  if (typeof account.private_key === "string") {
    account.private_key = account.private_key.replace(/\\n/g, "\n");
  }
  return account;
}

function loadServiceAccount(): Record<string, unknown> {
  const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonEnv) {
    try {
      return normalizeServiceAccount(
        JSON.parse(jsonEnv) as Record<string, unknown>,
      );
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT is invalid JSON. Re-run npm run setup:vercel-env.",
      );
    }
  }

  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    resolve("firebase/service-account.json");

  if (!existsSync(serviceAccountPath)) {
    throw new Error(
      "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT (Vercel) or firebase/service-account.json (local).",
    );
  }

  return normalizeServiceAccount(
    JSON.parse(readFileSync(serviceAccountPath, "utf8")) as Record<
      string,
      unknown
    >,
  );
}

export function initAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  return initializeApp({ credential: cert(loadServiceAccount()) });
}

export function getAdminDb() {
  initAdminApp();
  return getFirestore();
}
