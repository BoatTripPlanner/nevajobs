import "server-only";
import { getStorage } from "firebase-admin/storage";
import { getUnlockedCandidateIds } from "@/lib/billing/unlock-candidate-server";
import { redactContactFromPdf } from "@/lib/cv/pdf-redact";
import { initAdminApp } from "@/lib/firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, STORAGE_PATHS, type Usuario } from "@/types";

function getStorageBucket() {
  initAdminApp();
  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    process.env.FIREBASE_STORAGE_BUCKET;
  return bucketName ? getStorage().bucket(bucketName) : getStorage().bucket();
}

export function resolveCvStoragePath(candidato: Usuario): string | null {
  if (candidato.cv_storage_path) return candidato.cv_storage_path;
  if (candidato.url_cv?.startsWith("cvs/")) return candidato.url_cv;
  if (candidato.url_cv) {
    const encoded = candidato.url_cv.match(/cvs%2F([^?]+)/i);
    if (encoded) {
      return `cvs/${decodeURIComponent(encoded[1].replace(/%2F/g, "/"))}`;
    }
  }
  return `${STORAGE_PATHS.CVS}/${candidato.uid}/cv.pdf`;
}

async function downloadCvBytes(candidato: Usuario): Promise<Uint8Array | null> {
  const storagePath = resolveCvStoragePath(candidato);
  if (!storagePath && !candidato.url_cv) return null;

  if (candidato.url_cv?.startsWith("http")) {
    try {
      const res = await fetch(candidato.url_cv);
      if (!res.ok) return null;
      return new Uint8Array(await res.arrayBuffer());
    } catch {
      return null;
    }
  }

  if (!storagePath) return null;

  try {
    const [buffer] = await getStorageBucket().file(storagePath).download();
    return new Uint8Array(buffer);
  } catch {
    return null;
  }
}

export async function getCvForEmpresa(
  empresaId: string,
  candidatoId: string,
): Promise<
  | { ok: true; bytes: Uint8Array; redacted: boolean; filename: string }
  | { ok: false; error: string; status: number }
> {
  const db = getAdminDb();
  const [empresaSnap, candidatoSnap, unlockedIds] = await Promise.all([
    db.collection(COLLECTIONS.USUARIOS).doc(empresaId).get(),
    db.collection(COLLECTIONS.USUARIOS).doc(candidatoId).get(),
    getUnlockedCandidateIds(empresaId),
  ]);

  if (!empresaSnap.exists || empresaSnap.data()?.rol !== "empresa") {
    return { ok: false, error: "Forbidden", status: 403 };
  }
  if (!candidatoSnap.exists || candidatoSnap.data()?.rol !== "candidato") {
    return { ok: false, error: "Candidate not found", status: 404 };
  }

  const candidato = {
    uid: candidatoSnap.id,
    ...candidatoSnap.data(),
  } as Usuario;

  const raw = await downloadCvBytes(candidato);
  if (!raw) {
    return { ok: false, error: "CV not available", status: 404 };
  }

  const unlocked = unlockedIds.includes(candidatoId);
  if (unlocked) {
    return {
      ok: true,
      bytes: raw,
      redacted: false,
      filename: `${candidato.nombre.replace(/\s+/g, "-")}-cv.pdf`,
    };
  }

  const redacted = await redactContactFromPdf(raw);
  return {
    ok: true,
    bytes: redacted,
    redacted: true,
    filename: `${candidato.nombre.replace(/\s+/g, "-")}-cv-preview.pdf`,
  };
}
