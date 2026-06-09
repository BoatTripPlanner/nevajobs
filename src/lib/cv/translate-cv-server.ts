import "server-only";
import { canUseCvTranslator } from "@/lib/billing/sprint-service";
import { resolveCvStoragePath } from "@/lib/cv/cv-access-server";
import { getStorage } from "firebase-admin/storage";
import { initAdminApp } from "@/lib/firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS, STORAGE_PATHS, type CodigoIdioma, type Usuario } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

const TARGET_LANGS: CodigoIdioma[] = ["FR", "EN", "DE"];

function getBucket() {
  initAdminApp();
  const bucketName =
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    process.env.FIREBASE_STORAGE_BUCKET;
  return bucketName ? getStorage().bucket(bucketName) : getStorage().bucket();
}

async function downloadCvText(candidato: Usuario): Promise<string | null> {
  const path = resolveCvStoragePath(candidato);
  if (!path) return null;

  try {
    const [buffer] = await getBucket().file(path).download();
    const raw = buffer.toString("utf8");
    if (raw.trim().length > 50) return raw.slice(0, 12000);
    return `CV profile for ${candidato.nombre}. Role: ${candidato.rol_buscado ?? ""}. Languages: ${(candidato.idiomas_hablados ?? []).join(", ")}. Certification: ${candidato.titulacion ?? ""}. Country: ${candidato.pais_origen}.`;
  } catch {
    return `CV profile for ${candidato.nombre}. Role: ${candidato.rol_buscado ?? ""}. Languages: ${(candidato.idiomas_hablados ?? []).join(", ")}.`;
  }
}

const LANG_NAMES: Record<CodigoIdioma, string> = {
  FR: "French",
  EN: "English",
  DE: "German",
  ES: "Spanish",
  IT: "Italian",
  PT: "Portuguese",
  NL: "Dutch",
};

async function translateWithAi(
  text: string,
  target: CodigoIdioma,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `[${LANG_NAMES[target]} translation — configure OPENAI_API_KEY]\n\n${text}`;
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a professional CV translator for seasonal ski resort workers in Europe. Translate the CV content accurately into the target language. Keep formatting simple (plain text). Do not invent experience.",
        },
        {
          role: "user",
          content: `Translate this CV/resume content to ${LANG_NAMES[target]}:\n\n${text}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? text;
}

export async function translateCandidateCv(
  uid: string,
  targetLang: CodigoIdioma,
): Promise<
  | { ok: true; lang: CodigoIdioma; storage_path: string; preview: string }
  | { ok: false; error: string; status: number }
> {
  if (!TARGET_LANGS.includes(targetLang)) {
    return { ok: false, error: "Unsupported language", status: 400 };
  }

  const snap = await getAdminDb().collection(COLLECTIONS.USUARIOS).doc(uid).get();
  if (!snap.exists || snap.data()?.rol !== "candidato") {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  const candidato = { uid: snap.id, ...snap.data() } as Usuario;
  if (!canUseCvTranslator(candidato)) {
    return { ok: false, error: "Ski Pass required", status: 402 };
  }

  const source = await downloadCvText(candidato);
  if (!source) {
    return { ok: false, error: "CV not found", status: 404 };
  }

  const translated = await translateWithAi(source, targetLang);
  const storagePath = `${STORAGE_PATHS.CVS}/${uid}/cv-${targetLang.toLowerCase()}.txt`;

  await getBucket().file(storagePath).save(translated, {
    contentType: "text/plain; charset=utf-8",
    metadata: { firebaseStorageDownloadTokens: crypto.randomUUID() },
  });

  const traducciones = {
    ...(candidato.cv_traducciones ?? {}),
    [targetLang]: storagePath,
  };

  await getAdminDb()
    .collection(COLLECTIONS.USUARIOS)
    .doc(uid)
    .set(
      {
        cv_traducciones: traducciones,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return {
    ok: true,
    lang: targetLang,
    storage_path: storagePath,
    preview: translated.slice(0, 500),
  };
}
