import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type Postulacion } from "@/types";

export async function applyToJob(input: {
  oferta_id: string;
  candidato_id: string;
  empresa_id: string;
  mensaje_presentacion?: string;
}): Promise<string> {
  const existing = await getDocs(
    query(
      collection(db, COLLECTIONS.POSTULACIONES),
      where("candidato_id", "==", input.candidato_id),
    ),
  );

  const duplicate = existing.docs.find(
    (docSnap) => docSnap.data().oferta_id === input.oferta_id,
  );
  if (duplicate) {
    return duplicate.id;
  }

  const ref = await addDoc(collection(db, COLLECTIONS.POSTULACIONES), {
    oferta_id: input.oferta_id,
    candidato_id: input.candidato_id,
    empresa_id: input.empresa_id,
    estado: "pendiente",
    mensaje_presentacion: input.mensaje_presentacion?.trim() || null,
    perfil_desbloqueado: false,
    fecha_postulacion: serverTimestamp(),
  });

  return ref.id;
}

export async function getMyApplications(candidatoId: string): Promise<Postulacion[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.POSTULACIONES),
      where("candidato_id", "==", candidatoId),
    ),
  );

  return snap.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Postulacion,
  );
}

export async function getApplicationsForEmpresa(
  empresaId: string,
): Promise<Postulacion[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.POSTULACIONES),
      where("empresa_id", "==", empresaId),
    ),
  );

  return snap.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Postulacion,
  );
}
