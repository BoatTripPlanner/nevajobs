import "server-only";
import { getAuth } from "firebase-admin/auth";
import { initAdminApp } from "@/lib/firebase-admin";

export async function verifyIdToken(
  authorizationHeader: string | null,
): Promise<string | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice(7);
  if (!token) return null;

  try {
    initAdminApp();
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
