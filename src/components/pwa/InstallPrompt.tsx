"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "nevajobs-pwa-dismiss";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const t = useTranslations("pwa");
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (isIos()) {
      const timer = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      role="dialog"
      aria-label={t("title")}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-cyan-200 bg-white p-4 shadow-xl shadow-slate-300/40">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-lg font-bold text-white">
          N
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{t("title")}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
            {iosHint ? t("iosHint") : t("androidHint")}
          </p>
          {!iosHint && deferredPrompt && (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              {t("install")}
            </button>
          )}
          {iosHint && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-700">
              <Share className="h-3.5 w-3.5" />
              {t("iosAction")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
