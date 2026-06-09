import { canUseAiOfferGenerator } from "@/lib/billing/plan-access";
import { verifyIdToken } from "@/lib/auth/verify-id-token";
import { getAdminDb } from "@/lib/firebase-admin";
import { generateJobOffer } from "@/lib/offers/generate-offer";
import { COLLECTIONS, type Usuario } from "@/types";

export async function POST(request: Request) {
  const uid = await verifyIdToken(request.headers.get("authorization"));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const empresaSnap = await getAdminDb().collection(COLLECTIONS.USUARIOS).doc(uid).get();
  if (!empresaSnap.exists) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const empresa = { uid, ...empresaSnap.data() } as Usuario;
  if (empresa.rol !== "empresa" || !canUseAiOfferGenerator(empresa)) {
    return Response.json({ error: "Starter plan or higher required" }, { status: 403 });
  }

  let body: { rol?: string; estacion?: string; idioma?: string; categoria?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.rol?.trim() || !body.estacion?.trim() || !body.idioma?.trim()) {
    return Response.json({ error: "rol, estacion and idioma are required" }, { status: 400 });
  }

  const offer = await generateJobOffer({
    rol: body.rol,
    estacion: body.estacion,
    idioma: body.idioma,
    categoria: body.categoria,
    empresa: empresa.nombre,
  });

  return Response.json(offer);
}
