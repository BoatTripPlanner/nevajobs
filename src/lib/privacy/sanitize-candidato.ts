import { hasSkiPass } from "@/lib/billing/sprint-service";
import type { Usuario } from "@/types";

/** Perfil visible para empresas antes de desbloquear (sin contacto ni CV directo). */
export type CandidatoPublicView = Pick<
  Usuario,
  | "uid"
  | "nombre"
  | "rol"
  | "rol_buscado"
  | "titulacion"
  | "modalidad_principal"
  | "idiomas_hablados"
  | "pais_origen"
  | "estacion_actual"
  | "disponibilidad_inmediata"
  | "permiso_trabajo_ue"
  | "en_estacion"
  | "valoracion_media"
  | "verificado_nevajobs"
  | "temporadas_completadas"
  | "pareja_uid"
  | "perfil_completo"
  | "badge_verified_speed"
  | "tiene_ski_pass"
> & {
  has_cv: boolean;
  badge_top_candidate: boolean;
};

/** Datos de contacto y CV revelados tras desbloqueo de pago. */
export type CandidatoUnlockedView = CandidatoPublicView & {
  email: string;
  telefono?: string;
  url_audio_intro?: string;
  url_video_intro?: string;
};

export function sanitizeCandidatoForEmployer(
  candidato: Usuario,
  unlocked: boolean,
): CandidatoPublicView | Usuario {
  const base: CandidatoPublicView = {
    uid: candidato.uid,
    nombre: candidato.nombre,
    rol: candidato.rol,
    rol_buscado: candidato.rol_buscado,
    titulacion: candidato.titulacion,
    modalidad_principal: candidato.modalidad_principal,
    idiomas_hablados: candidato.idiomas_hablados,
    pais_origen: candidato.pais_origen,
    estacion_actual: candidato.estacion_actual,
    disponibilidad_inmediata: candidato.disponibilidad_inmediata,
    permiso_trabajo_ue: candidato.permiso_trabajo_ue,
    en_estacion: candidato.en_estacion,
    valoracion_media: candidato.valoracion_media,
    verificado_nevajobs: candidato.verificado_nevajobs,
    temporadas_completadas: candidato.temporadas_completadas,
    pareja_uid: candidato.pareja_uid,
    perfil_completo: candidato.perfil_completo,
    badge_verified_speed: candidato.badge_verified_speed,
    tiene_ski_pass: candidato.tiene_ski_pass,
    has_cv: Boolean(candidato.url_cv || candidato.cv_storage_path),
    badge_top_candidate: hasSkiPass(candidato),
  };

  if (!unlocked) {
    return base;
  }

  return {
    ...candidato,
    has_cv: Boolean(candidato.url_cv || candidato.cv_storage_path),
    badge_top_candidate: hasSkiPass(candidato),
  };
}
