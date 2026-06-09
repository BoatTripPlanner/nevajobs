import { verifyIdToken } from "@/lib/auth/verify-id-token";
import {
  canApplyToOffer,
  canUseEarlyAccess,
  getEarlyAccessUnlockAt,
} from "@/lib/billing/sprint-service";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Oferta, type Usuario } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { oferta_id?: string; mensaje_presentacion?: string };
  try {
    body = (await request.json()) as {
      oferta_id?: string;
      mensaje_presentacion?: string;
    };
  } catch {
    return Response.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.oferta_id) {
    return Response.json({ error: "Missing oferta_id." }, { status: 400 });
  }

  const db = getAdminDb();
  const [candidatoSnap, ofertaSnap] = await Promise.all([
    db.collection(COLLECTIONS.USUARIOS).doc(uid).get(),
    db.collection(COLLECTIONS.OFERTAS).doc(body.oferta_id).get(),
  ]);

  if (!candidatoSnap.exists || candidatoSnap.data()?.rol !== "candidato") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!ofertaSnap.exists || !ofertaSnap.data()?.activa) {
    return Response.json({ error: "Job not found or inactive." }, { status: 404 });
  }

  const candidato = {
    uid: candidatoSnap.id,
    ...candidatoSnap.data(),
  } as Usuario;
  const oferta = {
    id: ofertaSnap.id,
    ...ofertaSnap.data(),
  } as Oferta;

  const access = canApplyToOffer(candidato, oferta);
  if (!access.allowed) {
    return Response.json(
      {
        error: "Early access required",
        code: "early_access",
        unlocks_at: access.unlocksAt?.toISOString(),
      },
      { status: 403 },
    );
  }

  const existing = await db
    .collection(COLLECTIONS.POSTULACIONES)
    .where("candidato_id", "==", uid)
    .where("oferta_id", "==", body.oferta_id)
    .limit(1)
    .get();

  if (!existing.empty) {
    return Response.json({ id: existing.docs[0].id, alreadyApplied: true });
  }

  const vipUntil = getEarlyAccessUnlockAt(oferta);
  const inVipWindow = Boolean(
    vipUntil && Date.now() < vipUntil.getTime(),
  );

  const ref = await db.collection(COLLECTIONS.POSTULACIONES).add({
    oferta_id: body.oferta_id,
    candidato_id: uid,
    empresa_id: oferta.empresa_id,
    estado: "pendiente",
    mensaje_presentacion: body.mensaje_presentacion?.trim() || null,
    perfil_desbloqueado: false,
    fecha_postulacion: FieldValue.serverTimestamp(),
    acceso_temprano: Boolean(
      oferta.incluye_alojamiento
        && canUseEarlyAccess(candidato)
        && inVipWindow,
    ),
  });

  return Response.json({ id: ref.id });
}
