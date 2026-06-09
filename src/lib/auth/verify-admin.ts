import "server-only";
import { getAuth } from "firebase-admin/auth";
import { isCreatorEmail } from "@/lib/admin/creator";
import { initAdminApp } from "@/lib/firebase-admin";

export async function verifyAdminToken(
  authorizationHeader: string | null,
): Promise<{ uid: string; email: string } | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice(7);
  if (!token) return null;

  try {
    initAdminApp();
    const decoded = await getAuth().verifyIdToken(token);
    const email = decoded.email;
    if (!email || !isCreatorEmail(email)) {
      return null;
    }
    return { uid: decoded.uid, email };
  } catch {
    return null;
  }
}
