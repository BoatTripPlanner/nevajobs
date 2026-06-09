import type { JobCategory } from "./job";

type CategoriaOferta = "hoteles" | "escuelas" | "alquiler" | "oficina";

const CATEGORIA_MAP: Record<JobCategory, CategoriaOferta> = {
  hotels: "hoteles",
  schools: "escuelas",
  rental: "alquiler",
  office: "oficina",
};

const CATEGORIA_REVERSE: Record<CategoriaOferta, JobCategory> = {
  hoteles: "hotels",
  escuelas: "schools",
  alquiler: "rental",
  oficina: "office",
};

export function categoriaToFirestore(category: JobCategory): CategoriaOferta {
  return CATEGORIA_MAP[category];
}

export function categoriaFromFirestore(categoria: CategoriaOferta): JobCategory {
  return CATEGORIA_REVERSE[categoria];
}
