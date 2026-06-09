import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Usuario } from "@/types";
import type { Candidate } from "@/types/job";

export function usuarioToCandidate(usuario: Usuario): Candidate {
  return {
    id: usuario.uid,
    name: usuario.nombre,
    role:
      usuario.rol_buscado ??
      usuario.titulacion ??
      (usuario.modalidad_principal
        ? `${usuario.modalidad_principal} professional`
        : "Seasonal worker"),
    resort: usuario.estacion_actual ?? "Flexible location",
    country: usuario.pais_origen,
    languages: usuario.idiomas_hablados.map(String),
    immediateAvailability: usuario.disponibilidad_inmediata,
    inResort: Boolean(usuario.en_estacion ?? usuario.estacion_actual),
    voiceIntroUrl: usuario.url_audio_intro,
    voiceIntroDuration: 30,
  };
}

export async function getAvailableCandidates(max = 12): Promise<Candidate[]> {
  try {
    const db = getAdminDb();

    const snap = await db
      .collection(COLLECTIONS.USUARIOS)
      .where("rol", "==", "candidato")
      .where("disponibilidad_inmediata", "==", true)
      .limit(max)
      .get();

    return snap.docs.map((doc) =>
      usuarioToCandidate({ uid: doc.id, ...doc.data() } as Usuario),
    );
  } catch (error) {
    console.error("[getAvailableCandidates]", error);
    return [];
  }
}
