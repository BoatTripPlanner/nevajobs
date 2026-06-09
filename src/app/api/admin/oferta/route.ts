import { adminDeleteOferta, adminSetOfertaActiva } from "@/lib/admin/admin-ofertas-server";
import { verifyAdminToken } from "@/lib/auth/verify-admin";

export async function POST(request: Request) {
  const admin = await verifyAdminToken(request.headers.get("authorization"));
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { ofertaId?: string; action?: "delete" | "activate" | "deactivate" };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.ofertaId || !body.action) {
    return Response.json({ error: "Missing ofertaId or action" }, { status: 400 });
  }

  try {
    if (body.action === "delete") {
      await adminDeleteOferta(body.ofertaId);
    } else if (body.action === "activate") {
      await adminSetOfertaActiva(body.ofertaId, true);
    } else if (body.action === "deactivate") {
      await adminSetOfertaActiva(body.ofertaId, false);
    } else {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed";
    return Response.json({ error: message }, { status: 400 });
  }

  return Response.json({ ok: true });
}
