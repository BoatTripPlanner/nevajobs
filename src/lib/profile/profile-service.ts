import { isCreatorEmail } from "@/lib/admin/creator";
import { doc, deleteField, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  COLLECTIONS,
  type CategoriaOferta,
  type CodigoIdioma,
  type ModalidadDeportiva,
  type Usuario,
} from "@/types";

export type CandidatoProfileInput = {
  rol_buscado: string;
  idiomas_hablados: CodigoIdioma[];
  titulacion?: string;
  modalidad_principal?: ModalidadDeportiva;
  estacion_actual?: string;
  disponibilidad_inmediata: boolean;
  permiso_trabajo_ue: boolean;
  en_estacion: boolean;
};

export type EmpresaProfileInput = {
  descripcion_empresa: string;
  categorias_contratacion: CategoriaOferta[];
  estaciones_operacion: string[];
  sitio_web?: string;
  /** Enterprise: email para alertas de candidatos Top (vacío = email de cuenta). */
  alerta_email?: string;
};

export function isProfileComplete(profile: Usuario | null): boolean {
  if (!profile) return false;
  if (profile.perfil_completo === true) return true;

  if (profile.rol === "candidato") {
    return Boolean(
      profile.rol_buscado?.trim()
        && profile.idiomas_hablados?.length > 0
        && profile.pais_origen?.trim(),
    );
  }

  return Boolean(
    profile.nombre?.trim()
      && profile.pais_origen?.trim()
      && profile.descripcion_empresa?.trim()
      && (profile.categorias_contratacion?.length ?? 0) > 0,
  );
}

export function getPostLoginPath(
  profile: Usuario | null,
  override?: string,
  email?: string | null,
): string {
  if (isCreatorEmail(email)) return "/admin";
  if (override) return override;
  if (!isProfileComplete(profile)) return "/profile/setup";
  return "/dashboard";
}

export async function saveCandidatoProfile(
  uid: string,
  input: CandidatoProfileInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    rol_buscado: input.rol_buscado.trim(),
    idiomas_hablados: input.idiomas_hablados,
    titulacion: input.titulacion?.trim() ? input.titulacion.trim() : deleteField(),
    modalidad_principal: input.modalidad_principal ?? deleteField(),
    estacion_actual: input.estacion_actual?.trim() ? input.estacion_actual.trim() : deleteField(),
    disponibilidad_inmediata: input.disponibilidad_inmediata,
    permiso_trabajo_ue: input.permiso_trabajo_ue,
    en_estacion: input.en_estacion,
    perfil_completo: true,
    updated_at: serverTimestamp(),
  });
}

export async function saveEmpresaProfile(
  uid: string,
  input: EmpresaProfileInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    descripcion_empresa: input.descripcion_empresa.trim(),
    categorias_contratacion: input.categorias_contratacion,
    estaciones_operacion: input.estaciones_operacion,
    sitio_web: input.sitio_web?.trim() ? input.sitio_web.trim() : deleteField(),
    alerta_email: input.alerta_email?.trim()
      ? input.alerta_email.trim().toLowerCase()
      : deleteField(),
    perfil_completo: true,
    updated_at: serverTimestamp(),
  });
}

export async function saveEmpresaAlertEmail(
  uid: string,
  email: string,
): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  await updateDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    alerta_email: trimmed ? trimmed : deleteField(),
    updated_at: serverTimestamp(),
  });
}
