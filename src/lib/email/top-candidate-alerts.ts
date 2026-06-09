import "server-only";
import { canUseEmailAlerts } from "@/lib/billing/plan-access";
import { hasSkiPass } from "@/lib/billing/sprint-service";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, type Usuario } from "@/types";

export function isTopCandidate(candidato: Usuario): boolean {
  return Boolean(candidato.badge_verified_speed || hasSkiPass(candidato));
}

function matchesEmpresaZone(empresa: Usuario, candidato: Usuario): boolean {
  const stations = empresa.estaciones_operacion ?? [];
  if (stations.length === 0) return true;

  const candStation = (candidato.estacion_actual ?? "").toLowerCase();
  const candCountry = (candidato.pais_origen ?? "").toLowerCase();
  const candRole = (candidato.rol_buscado ?? "").toLowerCase();

  return stations.some((station) => {
    const s = station.toLowerCase().trim();
    if (!s) return false;
    return (
      (candStation && (candStation.includes(s) || s.includes(candStation)))
      || (candCountry && (candCountry.includes(s) || s.includes(candCountry)))
      || (candRole && candRole.includes(s))
    );
  });
}

function resolveAlertEmail(empresa: Usuario): string | null {
  const email = (empresa.alerta_email ?? empresa.email)?.trim().toLowerCase();
  return email && email.includes("@") ? email : null;
}

async function sendAlertEmail(
  to: string,
  empresa: Usuario,
  candidato: Usuario,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.ALERT_FROM_EMAIL ?? "Nevajobs <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      "[top-candidate-alert] RESEND_API_KEY not set — would email",
      to,
      "about",
      candidato.nombre,
    );
    return;
  }

  const badges: string[] = [];
  if (candidato.badge_verified_speed) badges.push("Verified Speed");
  if (hasSkiPass(candidato)) badges.push("Top Candidate (Ski Pass)");

  const subject = `Nevajobs — Nuevo candidato Top: ${candidato.nombre}`;
  const html = `
    <p>Hola ${empresa.nombre},</p>
    <p>Un candidato <strong>Top</strong> acaba de activarse en tu zona en Nevajobs:</p>
    <ul>
      <li><strong>Nombre:</strong> ${candidato.nombre}</li>
      <li><strong>Puesto:</strong> ${candidato.rol_buscado ?? "—"}</li>
      <li><strong>País:</strong> ${candidato.pais_origen ?? "—"}</li>
      <li><strong>Estación:</strong> ${candidato.estacion_actual ?? "—"}</li>
      <li><strong>Insignias:</strong> ${badges.join(", ") || "Top"}</li>
    </ul>
    <p>Entra en tu <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://nevajobs.vercel.app"}/dashboard">panel de empresa</a> para ver matches y desbloquear el perfil.</p>
    <p style="color:#64748b;font-size:12px;">Alerta Enterprise por email · Nevajobs</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[top-candidate-alert] Resend error", res.status, body);
  }
}

export async function notifyEnterprisesOfTopCandidate(
  candidato: Usuario,
): Promise<void> {
  if (candidato.rol !== "candidato" || !isTopCandidate(candidato)) return;

  const snap = await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .where("rol", "==", "empresa")
    .where("plan_empresa", "==", "enterprise")
    .get();

  const tasks: Promise<void>[] = [];

  for (const doc of snap.docs) {
    const empresa = { uid: doc.id, ...doc.data() } as Usuario;
    if (!canUseEmailAlerts(empresa)) continue;
    if (!matchesEmpresaZone(empresa, candidato)) continue;

    const to = resolveAlertEmail(empresa);
    if (!to) continue;

    tasks.push(sendAlertEmail(to, empresa, candidato));
  }

  await Promise.allSettled(tasks);
}

export async function notifyTopCandidateIfEligible(uid: string): Promise<void> {
  const snap = await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .get();

  if (!snap.exists) return;

  const candidato = { uid: snap.id, ...snap.data() } as Usuario;
  await notifyEnterprisesOfTopCandidate(candidato);
}
