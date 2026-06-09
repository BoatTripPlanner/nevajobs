import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getCvForEmpresa } from "@/lib/cv/cv-access-server";

export async function GET(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidatoId = new URL(request.url).searchParams.get("candidato_id");
  if (!candidatoId) {
    return Response.json({ error: "Missing candidato_id" }, { status: 400 });
  }

  try {
    const result = await getCvForEmpresa(uid, candidatoId);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return new Response(Buffer.from(result.bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${result.filename}"`,
        "X-Cv-Redacted": result.redacted ? "true" : "false",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[employers/cv]", err);
    return Response.json({ error: "CV processing failed" }, { status: 500 });
  }
}
