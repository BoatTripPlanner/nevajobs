"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";

interface VoiceIntroPlayerProps {
  duration?: number;
  audioUrl?: string;
}

export function VoiceIntroPlayer({
  duration = 30,
  audioUrl,
}: VoiceIntroPlayerProps) {
  const t = useTranslations("voice");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing || audioUrl) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setPlaying(false);
          return 0;
        }
        return prev + 100 / duration;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, duration, audioUrl]);

  function togglePlay() {
    if (audioUrl && audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play();
      }
      setPlaying(!playing);
      return;
    }

    if (playing) {
      setPlaying(false);
      setProgress(0);
    } else {
      setProgress(0);
      setPlaying(true);
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
          }}
          onTimeUpdate={() => {
            const el = audioRef.current;
            if (el?.duration) {
              setProgress((el.currentTime / el.duration) * 100);
            }
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? t("pause") : t("play")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm transition hover:from-violet-600 hover:to-fuchsia-600"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-violet-800">
            {t("title", { seconds: duration })}
          </p>
          <p className="truncate text-[10px] text-slate-500">{t("subtitle")}</p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
