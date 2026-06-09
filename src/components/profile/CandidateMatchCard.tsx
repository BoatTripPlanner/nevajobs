"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileCheck,
  Loader2,
  Lock,
  MessageCircle,
  RotateCcw,
  Shield,
  Unlock,
  Video,
} from "lucide-react";
import { VoiceIntroPlayer } from "@/components/home/VoiceIntroPlayer";
import { getReliabilityTier } from "@/lib/billing/plan-access";
import { unlockCandidate } from "@/lib/data/desbloqueos-client";
import type { MatchResult } from "@/lib/match/compute-match";
import type { Oferta, Usuario } from "@/types";

type UnlockMeta = {
  chat_hasta?: string;
  garantia_hasta?: string;
  uso_credito?: boolean;
};

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
  const [meta, setMeta] = useState<UnlockMeta | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundDone, setRefundDone] = useState(false);

  const reliability = getReliabilityTier(candidato.temporadas_completadas);

  useEffect(() => {
    if (!isUnlocked || unlockedData || !idToken) return;
    void unlockCandidate(idToken, candidato.uid, oferta.id).then((result) => {
      if (result.ok) {
        setUnlockedData(result.candidato);
        setMeta(result.meta ?? null);
      }
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
      setMeta(result.meta ?? null);
      onUnlocked(candidato.uid, result.candidato);
    } finally {
      setUnlocking(false);
    }
  }

  async function handleRefund(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRefundLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/employers/request-refund", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidato_id: candidato.uid,
          doc_alta_url: form.get("doc_alta"),
          doc_baja_url: form.get("doc_baja"),
          motivo: form.get("motivo"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        onUnlockError(data.error ?? t("refundFailed"));
        return;
      }
      setRefundDone(true);
      setShowRefund(false);
    } finally {
      setRefundLoading(false);
    }
  }

  const garantiaActive =
    meta?.garantia_hasta && new Date(meta.garantia_hasta) > new Date();

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
        {candidato.permiso_trabajo_ue ? (
          <li className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800 ring-1 ring-blue-200">
            <Shield className="h-3 w-3" />
            {t("visaOk")}
          </li>
        ) : (
          <li className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 ring-1 ring-amber-200">
            {t("visaRequired")}
          </li>
        )}
        <li className="rounded-md bg-violet-50 px-2 py-1 text-xs text-violet-800 ring-1 ring-violet-200">
          {t(`reliability.${reliability}`)}
        </li>
        {match.reasons.slice(0, 2).map((reason) => (
          <li
            key={reason}
            className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
          >
            {tMatch(`reasons.${reason}`)}
          </li>
        ))}
      </ul>

      {revealed ? (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            {t("profileUnlocked")}
          </p>
          {meta?.chat_hasta && (
            <p className="text-xs text-emerald-700">
              {t("chatUntil", {
                date: new Date(meta.chat_hasta).toLocaleDateString(),
              })}
            </p>
          )}
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
          {unlockedData?.url_video_intro && (
            <a
              href={unlockedData.url_video_intro}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:underline"
            >
              <Video className="h-4 w-4" />
              {t("watchVideoIntro")}
            </a>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm font-medium text-cyan-700"
          >
            <MessageCircle className="h-4 w-4" />
            {t("openChat")}
          </button>

          {meta?.uso_credito && garantiaActive && !refundDone && (
            <div className="border-t border-emerald-200 pt-3">
              <button
                type="button"
                onClick={() => setShowRefund((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("requestRefund")}
              </button>
              {showRefund && (
                <form onSubmit={handleRefund} className="mt-3 space-y-2">
                  <p className="text-xs text-slate-600">{t("refundDocsHint")}</p>
                  <input
                    name="doc_alta"
                    required
                    placeholder={t("docAltaPlaceholder")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    name="doc_baja"
                    required
                    placeholder={t("docBajaPlaceholder")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    name="motivo"
                    placeholder={t("refundReasonPlaceholder")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={refundLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                  >
                    {refundLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <FileCheck className="h-3 w-3" />
                    )}
                    {t("submitRefund")}
                  </button>
                </form>
              )}
            </div>
          )}
          {refundDone && (
            <p className="text-xs font-medium text-emerald-700">{t("refundApproved")}</p>
          )}
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
          {t("unlockHintPremium")}
        </p>
      )}
    </li>
  );
}
