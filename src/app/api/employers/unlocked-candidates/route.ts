import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getUnlockedCandidateIds } from "@/lib/billing/unlock-candidate-server";

export async function GET(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = await getUnlockedCandidateIds(uid);
  return Response.json({ candidato_ids: ids });
}
