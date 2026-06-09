import { canExportAts } from "@/lib/billing/plan-access";
import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { buildAtsCsv } from "@/lib/employers/ats-export-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Usuario } from "@/types";

export async function GET(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const empresaSnap = await getAdminDb().collection(COLLECTIONS.USUARIOS).doc(uid).get();
  if (!empresaSnap.exists) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const empresa = { uid, ...empresaSnap.data() } as Usuario;
  if (empresa.rol !== "empresa" || !canExportAts(empresa)) {
    return Response.json({ error: "Enterprise plan required" }, { status: 403 });
  }

  const csv = await buildAtsCsv(uid);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nevajobs-candidates-${uid.slice(0, 8)}.csv"`,
    },
  });
}
