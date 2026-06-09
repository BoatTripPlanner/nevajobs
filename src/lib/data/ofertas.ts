import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, type Oferta } from "@/types";
import { categoriaFromFirestore } from "@/types/mappers";
import type { Job } from "@/types/job";

export function ofertaToJob(oferta: Oferta): Job {
  return {
    id: oferta.id,
    title: oferta.titulo,
    resort: oferta.estacion,
    country: oferta.pais,
    category: categoriaFromFirestore(oferta.categoria),
    languages: oferta.idiomas_requeridos.map(String),
    accommodationIncluded: oferta.incluye_alojamiento,
    couplesWelcome: oferta.acepta_parejas,
    certificationRequired: oferta.categoria === "escuelas" && Boolean(oferta.modalidad),
    sportModality: oferta.modalidad,
    companyName: oferta.nombre_empresa,
  };
}

export async function getActiveOfertas(max = 50): Promise<Job[]> {
  const q = query(
    collection(db, COLLECTIONS.OFERTAS),
    where("activa", "==", true),
    limit(max),
  );

  const snap = await getDocs(q);

  const jobs = snap.docs.map((doc) =>
    ofertaToJob({ id: doc.id, ...doc.data() } as Oferta),
  );

  return jobs.sort((a, b) => a.title.localeCompare(b.title));
}
