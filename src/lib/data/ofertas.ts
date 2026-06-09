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

