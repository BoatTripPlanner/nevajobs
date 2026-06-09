import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { unlockCandidateForEmpresa } from "@/lib/billing/unlock-candidate-server";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { candidato_id?: string; oferta_id?: string };
  try {
    body = (await request.json()) as { candidato_id?: string; oferta_id?: string };
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.candidato_id) {
    return Response.json({ error: "Missing candidato_id." }, { status: 400 });
  }

  const result = await unlockCandidateForEmpresa(
    uid,
    body.candidato_id,
    body.oferta_id,
  );

  if (!result.ok) {
    return Response.json(
      { error: result.error, code: result.code },
      { status: result.code === "not_empresa" ? 403 : 402 },
    );
  }

  const { candidato } = result;
  return Response.json({
    alreadyUnlocked: result.alreadyUnlocked,
    usedCredit: result.usedCredit,
    candidato: {
      uid: candidato.uid,
      nombre: candidato.nombre,
      email: candidato.email,
      rol_buscado: candidato.rol_buscado,
      titulacion: candidato.titulacion,
      idiomas_hablados: candidato.idiomas_hablados,
      pais_origen: candidato.pais_origen,
      estacion_actual: candidato.estacion_actual,
      url_cv: candidato.url_cv,
      url_audio_intro: candidato.url_audio_intro,
      disponibilidad_inmediata: candidato.disponibilidad_inmediata,
      permiso_trabajo_ue: candidato.permiso_trabajo_ue,
      valoracion_media: candidato.valoracion_media,
      verificado_nevajobs: candidato.verificado_nevajobs,
    },
  });
}
