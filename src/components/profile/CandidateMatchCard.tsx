"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Lock, MessageCircle, Unlock } from "lucide-react";
import { VoiceIntroPlayer } from "@/components/home/VoiceIntroPlayer";
import { unlockCandidate } from "@/lib/data/desbloqueos-client";
import type { MatchResult } from "@/lib/match/compute-match";
import type { Oferta, Usuario } from "@/types";

export function CandidateMatchCard({
  oferta,
  candidato,
  match,
  isUnlocked,
  idToken,
  onUnlocked,
  onUnlockError,
}: {
  oferta: Oferta;
  candidato: Usuario;
  match: MatchResult;
  isUnlocked: boolean;
  idToken: string;
  onUnlocked: (candidatoId: string, data: Partial<Usuario>) => void;
  onUnlockError: (message: string) => void;
}) {
  const t = useTranslations("dashboard");
  const tMatch = useTranslations("match");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedData, setUnlockedData] = useState<Partial<Usuario> | null>(null);

  useEffect(() => {
    if (!isUnlocked || unlockedData || !idToken) return;
    void unlockCandidate(idToken, candidato.uid, oferta.id).then((result) => {
      if (result.ok) setUnlockedData(result.candidato);
    });
  }, [isUnlocked, idToken, candidato.uid, oferta.id, unlockedData]);

  const revealed = Boolean(unlockedData);

  async function handleUnlock() {
    setUnlocking(true);
    try {
      const result = await unlockCandidate(idToken, candidato.uid, oferta.id);
      if (!result.ok) {
        onUnlockError(result.error);
        return;
      }
      setUnlockedData(result.candidato);
      onUnlocked(candidato.uid, result.candidato);
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{candidato.nombre}</p>
          <p className="mt-1 text-sm text-slate-600">
            {candidato.rol_buscado} · {candidato.pais_origen}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {t("forJob")}: {oferta.titulo}
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
          {tMatch("score", { score: match.score })}
        </span>
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {match.reasons.slice(0, 3).map((reason) => (
          <li
            key={reason}
            className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
          >
            {tMatch(`reasons.${reason}`)}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        {t("languages")}: {candidato.idiomas_hablados.join(", ")}
      </p>

      {revealed ? (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {t("profileUnlocked")}
          </p>
          {unlockedData?.titulacion && (
            <p className="text-sm text-slate-700">
              <span className="font-medium">{t("certification")}:</span>{" "}
              {unlockedData.titulacion}
            </p>
          )}
          {unlockedData?.email && (
            <p className="text-sm text-slate-700">
              <span className="font-medium">{t("contactEmail")}:</span>{" "}
              {unlockedData.email}
            </p>
          )}
          {unlockedData?.url_cv && (
            <p className="text-sm">
              <a
                href={unlockedData.url_cv}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-cyan-700 hover:underline"
              >
                {t("downloadCv")}
              </a>
            </p>
          )}
          {unlockedData?.url_audio_intro && (
            <VoiceIntroPlayer
              audioUrl={unlockedData.url_audio_intro}
              duration={30}
            />
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700"
          >
            <MessageCircle className="h-4 w-4" />
            {t("openChat")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleUnlock}
          disabled={unlocking}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {unlocking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
          {t("unlockCandidate")}
        </button>
      )}

      {!revealed && (
        <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
          <Lock className="h-3 w-3" />
          {t("unlockHint")}
        </p>
      )}
    </li>
  );
}
