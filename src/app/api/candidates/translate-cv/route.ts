import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { translateCandidateCv } from "@/lib/cv/translate-cv-server";
import type { CodigoIdioma } from "@/types";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lang?: string };
  try {
    body = (await request.json()) as { lang?: string };
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  const lang = (body.lang ?? "FR").toUpperCase() as CodigoIdioma;
  const result = await translateCandidateCv(uid, lang);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({
    lang: result.lang,
    storage_path: result.storage_path,
    preview: result.preview,
  });
}
