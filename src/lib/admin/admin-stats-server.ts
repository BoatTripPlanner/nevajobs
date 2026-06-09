import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import { recalculateLiveStats } from "@/lib/stats/recalculate-live-stats";
import { COLLECTIONS, type Oferta, type PlanEmpresa, type Usuario } from "@/types";

export interface AdminUserRow {
  uid: string;
  nombre: string;
  email: string;
  rol: string;
  plan_empresa?: PlanEmpresa;
  creditos_disponibles: number;
  perfil_completo?: boolean;
  created_at?: string;
}

export interface AdminOfertaRow {
  id: string;
  titulo: string;
  nombre_empresa: string;
  estacion: string;
  activa: boolean;
  created_at?: string;
}

export interface AdminDashboardData {
  liveStats: {
    activeJobs: number;
    availableCandidates: number;
    topCountries: string[];
  };
  totals: {
    usuarios: number;
    candidatos: number;
    empresas: number;
    perfilesCompletos: number;
    ofertasActivas: number;
    ofertasTotal: number;
    postulaciones: number;
    desbloqueos: number;
  };
  plans: Record<PlanEmpresa, number>;
  recentUsers: AdminUserRow[];
  recentOfertas: AdminOfertaRow[];
}

function toIsoDate(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  if ("toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return undefined;
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const db = getAdminDb();

  const [
    usuariosSnap,
    ofertasSnap,
    postulacionesSnap,
    desbloqueosSnap,
    liveStats,
  ] = await Promise.all([
    db.collection(COLLECTIONS.USUARIOS).get(),
    db.collection(COLLECTIONS.OFERTAS).get(),
    db.collection(COLLECTIONS.POSTULACIONES).get(),
    db.collection(COLLECTIONS.DESBLOQUEOS).get(),
    recalculateLiveStats(),
  ]);

  const plans: Record<PlanEmpresa, number> = {
    gratis: 0,
    starter: 0,
    pro: 0,
    enterprise: 0,
  };

  let candidatos = 0;
  let empresas = 0;
  let perfilesCompletos = 0;

  const users: AdminUserRow[] = [];

  for (const doc of usuariosSnap.docs) {
    const data = doc.data() as Usuario;
    if (data.rol === "candidato") candidatos++;
    if (data.rol === "empresa") {
      empresas++;
      const plan = data.plan_empresa ?? (data.es_premium ? "pro" : "gratis");
      if (plan in plans) plans[plan as PlanEmpresa]++;
      else plans.gratis++;
    }
    if (data.perfil_completo) perfilesCompletos++;

    users.push({
      uid: doc.id,
      nombre: data.nombre ?? "—",
      email: data.email ?? "—",
      rol: data.rol,
      plan_empresa: data.plan_empresa,
      creditos_disponibles: data.creditos_disponibles ?? 0,
      perfil_completo: data.perfil_completo,
      created_at: toIsoDate(data.created_at),
    });
  }

  users.sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });

  let ofertasActivas = 0;
  const ofertas: AdminOfertaRow[] = [];

  for (const doc of ofertasSnap.docs) {
    const data = doc.data() as Oferta;
    if (data.activa) ofertasActivas++;
    ofertas.push({
      id: doc.id,
      titulo: data.titulo,
      nombre_empresa: data.nombre_empresa,
      estacion: data.estacion,
      activa: data.activa,
      created_at: toIsoDate(data.created_at),
    });
  }

  ofertas.sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });

  return {
    liveStats,
    totals: {
      usuarios: usuariosSnap.size,
      candidatos,
      empresas,
      perfilesCompletos,
      ofertasActivas,
      ofertasTotal: ofertasSnap.size,
      postulaciones: postulacionesSnap.size,
      desbloqueos: desbloqueosSnap.size,
    },
    plans,
    recentUsers: users.slice(0, 25),
    recentOfertas: ofertas.slice(0, 15),
  };
}
