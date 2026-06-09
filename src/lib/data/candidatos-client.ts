import type { CandidatoPublicView } from "@/lib/privacy/sanitize-candidato";
import type { CodigoIdioma } from "@/types";

export async function fetchCandidatosForEmpresa(
  idToken: string,
): Promise<CandidatoPublicView[]> {
  const res = await fetch("/api/employers/candidates", {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { candidatos?: CandidatoPublicView[] };
  return data.candidatos ?? [];
}

export async function downloadCandidateCv(
  idToken: string,
  candidatoId: string,
): Promise<{ blob: Blob; redacted: boolean } | null> {
  const res = await fetch(
    `/api/employers/cv?candidato_id=${encodeURIComponent(candidatoId)}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  if (!res.ok) return null;
  const redacted = res.headers.get("X-Cv-Redacted") === "true";
  const blob = await res.blob();
  return { blob, redacted };
}

export async function applyToJobApi(
  idToken: string,
  input: { oferta_id: string; mensaje_presentacion?: string },
): Promise<
  | { ok: true; id: string; alreadyApplied?: boolean }
  | { ok: false; error: string; code?: string; unlocksAt?: string }
> {
  const res = await fetch("/api/candidates/apply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = (await res.json()) as {
    error?: string;
    code?: string;
    id?: string;
    alreadyApplied?: boolean;
    unlocks_at?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      error: data.error ?? "Apply failed",
      code: data.code,
      unlocksAt: data.unlocks_at,
    };
  }

  return { ok: true, id: data.id ?? "", alreadyApplied: data.alreadyApplied };
}

export async function checkSprintComplete(idToken: string): Promise<boolean> {
  const res = await fetch("/api/candidates/sprint/complete", {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { awarded?: boolean };
  return Boolean(data.awarded);
}

export async function translateCv(
  idToken: string,
  lang: CodigoIdioma,
): Promise<{ preview: string } | null> {
  const res = await fetch("/api/candidates/translate-cv", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lang }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { preview?: string };
  return data.preview ? { preview: data.preview } : null;
}

export async function startCandidateCheckout(
  idToken: string,
  type: "ski_pass" | "profile_unlock",
): Promise<string | null> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type }),
  });
  const data = (await res.json()) as { url?: string };
  return data.url ?? null;
}
