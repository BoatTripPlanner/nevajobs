import { hasSkiPass } from "@/lib/billing/sprint-service";
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
    meta: result.meta,
    candidato: {
      uid: candidato.uid,
      nombre: candidato.nombre,
      email: candidato.email,
      telefono: candidato.telefono,
      rol_buscado: candidato.rol_buscado,
      titulacion: candidato.titulacion,
      idiomas_hablados: candidato.idiomas_hablados,
      pais_origen: candidato.pais_origen,
      estacion_actual: candidato.estacion_actual,
      has_cv: Boolean(candidato.url_cv || candidato.cv_storage_path),
      url_audio_intro: candidato.url_audio_intro,
      url_video_intro: candidato.url_video_intro,
      temporadas_completadas: candidato.temporadas_completadas,
      disponibilidad_inmediata: candidato.disponibilidad_inmediata,
      permiso_trabajo_ue: candidato.permiso_trabajo_ue,
      valoracion_media: candidato.valoracion_media,
      verificado_nevajobs: candidato.verificado_nevajobs,
      badge_verified_speed: candidato.badge_verified_speed,
      badge_top_candidate: hasSkiPass(candidato),
    },
  });
}
