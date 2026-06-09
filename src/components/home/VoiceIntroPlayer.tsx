"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

interface VoiceIntroPlayerProps {
  duration?: number;
  audioUrl?: string;
}

export function VoiceIntroPlayer({
  duration = 30,
  audioUrl,
}: VoiceIntroPlayerProps) {
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
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
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
          aria-label={playing ? "Pause voice intro" : "Play voice intro"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/25 transition hover:from-violet-400 hover:to-fuchsia-500"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-violet-200">
            Voice Intro ({duration}s)
          </p>
          <p className="truncate text-[10px] text-slate-500">
            Language passport · verify fluency before contact
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
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
