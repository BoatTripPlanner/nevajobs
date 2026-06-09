import type { CandidatoUnlockedView } from "@/lib/privacy/sanitize-candidato";

export async function fetchUnlockedCandidateIds(
  idToken: string,
): Promise<string[]> {
  const res = await fetch("/api/employers/unlocked-candidates", {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { candidato_ids?: string[] };
  return data.candidato_ids ?? [];
}

export type UnlockMeta = {
  chat_hasta?: string;
  garantia_hasta?: string;
  uso_credito?: boolean;
};

export async function unlockCandidate(
  idToken: string,
  candidatoId: string,
  ofertaId?: string,
): Promise<
  | {
      ok: true;
      candidato: CandidatoUnlockedView;
      alreadyUnlocked: boolean;
      meta?: UnlockMeta;
    }
  | { ok: false; error: string; code?: string }
> {
  const res = await fetch("/api/employers/unlock-candidate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ candidato_id: candidatoId, oferta_id: ofertaId }),
  });

  const data = (await res.json()) as {
    error?: string;
    code?: string;
    candidato?: CandidatoUnlockedView;
    alreadyUnlocked?: boolean;
    meta?: UnlockMeta;
  };

  if (!res.ok) {
    return { ok: false, error: data.error ?? "Unlock failed", code: data.code };
  }

  return {
    ok: true,
    candidato: data.candidato ?? ({} as CandidatoUnlockedView),
    alreadyUnlocked: Boolean(data.alreadyUnlocked),
    meta: data.meta,
  };
}
