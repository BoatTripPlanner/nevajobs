import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Usuario } from "@/types";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function buildAtsCsv(empresaId: string): Promise<string> {
  const db = getAdminDb();
  const desbloqueosSnap = await db
    .collection(COLLECTIONS.DESBLOQUEOS)
    .where("empresa_id", "==", empresaId)
    .get();

  const headers = [
    "nombre",
    "email",
    "rol_buscado",
    "pais_origen",
    "idiomas",
    "titulacion",
    "permiso_trabajo_ue",
    "temporadas_completadas",
    "disponibilidad_inmediata",
    "url_cv",
    "fecha_desbloqueo",
  ];

  const rows: string[] = [headers.join(",")];

  for (const doc of desbloqueosSnap.docs) {
    const desbloqueo = doc.data();
    const candSnap = await db
      .collection(COLLECTIONS.USUARIOS)
      .doc(desbloqueo.candidato_id as string)
      .get();
    if (!candSnap.exists) continue;
    const c = { uid: candSnap.id, ...candSnap.data() } as Usuario;
    const fecha = desbloqueo.fecha_desbloqueo?.toDate?.()?.toISOString() ?? "";

    rows.push(
      [
        c.nombre,
        c.email,
        c.rol_buscado ?? "",
        c.pais_origen,
        (c.idiomas_hablados ?? []).join(";"),
        c.titulacion ?? "",
        c.permiso_trabajo_ue ? "yes" : "no",
        String(c.temporadas_completadas ?? 0),
        c.disponibilidad_inmediata ? "yes" : "no",
        c.url_cv ?? "",
        fecha,
      ]
        .map((v) => csvEscape(String(v)))
        .join(","),
    );
  }

  return rows.join("\n");
}
