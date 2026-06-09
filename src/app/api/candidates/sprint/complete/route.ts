import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { shouldAwardVerifiedSpeed } from "@/lib/billing/sprint-service";
import { getAdminDb } from "@/lib/firebase-admin";
import { awardVerifiedSpeedBadge } from "@/lib/stripe-premium";
import { COLLECTIONS, type Usuario } from "@/types";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snap = await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .get();

  if (!snap.exists || snap.data()?.rol !== "candidato") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = { uid: snap.id, ...snap.data() } as Usuario;

  if (!shouldAwardVerifiedSpeed(profile)) {
    return Response.json({
      awarded: false,
      badge_verified_speed: Boolean(profile.badge_verified_speed),
    });
  }

  await awardVerifiedSpeedBadge(uid);

  return Response.json({ awarded: true, badge_verified_speed: true });
}
