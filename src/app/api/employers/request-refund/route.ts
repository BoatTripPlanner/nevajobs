import { requestCreditRefund } from "@/lib/billing/credit-refund-server";
import { verifyIdToken } from "@/lib/auth/verify-id-token";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    candidato_id?: string;
    doc_alta_url?: string;
    doc_baja_url?: string;
    motivo?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.candidato_id) {
    return Response.json({ error: "Missing candidato_id" }, { status: 400 });
  }

  const result = await requestCreditRefund(uid, body.candidato_id, {
    doc_alta_url: body.doc_alta_url ?? "",
    doc_baja_url: body.doc_baja_url ?? "",
    motivo: body.motivo ?? "Candidato no disponible o sin respuesta",
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true, refunded: result.refunded });
}
