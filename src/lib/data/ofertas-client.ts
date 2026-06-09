import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isProfileComplete } from "@/lib/profile/profile-service";
import { COLLECTIONS, type Oferta, type OfertaInput } from "@/types";

export async function getActiveOfertasClient(): Promise<Oferta[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.OFERTAS), where("activa", "==", true)),
  );

  return snap.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Oferta,
  );
}

export async function getEmpresaOfertas(empresaId: string): Promise<Oferta[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTIONS.OFERTAS),
      where("empresa_id", "==", empresaId),
    ),
  );

  return snap.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Oferta,
  );
}

export async function createOferta(
  input: Omit<OfertaInput, "activa" | "fecha_publicacion">,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.OFERTAS), {
    ...input,
    activa: true,
    fecha_publicacion: serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return ref.id;
}

export async function getAvailableCandidatos(): Promise<
  import("@/types").Usuario[]
> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.USUARIOS), where("rol", "==", "candidato")),
  );

  return snap.docs
    .map(
      (docSnap) =>
        ({ uid: docSnap.id, ...docSnap.data() }) as import("@/types").Usuario,
    )
    .filter((user) => user.perfil_completo === true || isProfileComplete(user));
}
