import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "bs_pwa_install_dismissed_v1";
const INSTALLED_KEY = "bs_pwa_installed_v1";
const DELAY_MS = 30_000;

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Capture the event as early as possible (module load on client).
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    try {
      localStorage.setItem(INSTALLED_KEY, "1");
    } catch {}
    deferredPrompt = null;
  });
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(INSTALLED_KEY)) return;
      if (localStorage.getItem(DISMISSED_KEY)) return;
    } catch {}

    const t = window.setTimeout(() => {
      // Show on Android (deferredPrompt available) or as informational on iOS.
      setShow(true);
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) {
      // iOS fallback: instruct user
      alert(
        "Para instalar: toque no botão Compartilhar do Safari e escolha 'Adicionar à Tela de Início'.",
      );
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      try {
        localStorage.setItem(INSTALLED_KEY, "1");
      } catch {}
    } else {
      try {
        localStorage.setItem(DISMISSED_KEY, "1");
      } catch {}
    }
    deferredPrompt = null;
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm animate-fade-in">
      <div
        className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div
          className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center"
          style={{ background: "var(--gradient-rose-gold)" }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Instale o BellaSalon</p>
          <p className="text-xs text-muted-foreground truncate">
            Acesso rápido em tela cheia, como um app nativo.
          </p>
        </div>
        <button
          onClick={install}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
          style={{ background: "var(--gradient-rose-gold)" }}
        >
          <Download className="w-3.5 h-3.5" /> Instalar
        </button>
        <button
          aria-label="Fechar"
          onClick={dismiss}
          className="p-1 rounded-md text-muted-foreground hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
