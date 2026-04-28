import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type TourStep = {
  targetId: string;
  title: string;
  description: string;
};

export function DemoTour({ steps, onFinish }: { steps: TourStep[]; onFinish: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = steps[i];

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setRect(el.getBoundingClientRect()), 300);
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.targetId]);

  if (!rect) {
    return (
      <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
        <div className="text-white">Carregando tour…</div>
      </div>
    );
  }

  const pad = 8;
  const tooltipTop = rect.bottom + 16 + window.scrollY;
  const tooltipLeft = Math.max(16, Math.min(window.innerWidth - 360, rect.left));

  return (
    <>
      {/* Overlay with cutout via 4 divs */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <div className="absolute bg-black/70" style={{ top: 0, left: 0, right: 0, height: rect.top - pad }} />
        <div className="absolute bg-black/70" style={{ top: rect.bottom + pad, left: 0, right: 0, bottom: 0 }} />
        <div className="absolute bg-black/70" style={{ top: rect.top - pad, left: 0, width: rect.left - pad, height: rect.height + pad * 2 }} />
        <div className="absolute bg-black/70" style={{ top: rect.top - pad, left: rect.right + pad, right: 0, height: rect.height + pad * 2 }} />
        <div
          className="absolute rounded-xl animate-pulse-soft"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 4px var(--rose-gold), 0 0 60px var(--rose-gold)",
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 w-[340px] bg-card rounded-xl p-5 animate-fade-in"
        style={{ top: tooltipTop, left: tooltipLeft, boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--gradient-rose-gold)" }}>
            {i + 1}/{steps.length}
          </span>
          <button onClick={onFinish} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-foreground mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
        <div className="flex items-center justify-between">
          <button onClick={onFinish} className="text-xs text-muted-foreground hover:text-foreground">
            Pular tour
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="px-3 py-1.5 rounded-lg border border-input text-sm disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" /> Anterior
            </button>
            {i < steps.length - 1 ? (
              <button
                onClick={() => setI((v) => v + 1)}
                className="px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-1"
                style={{ background: "var(--gradient-rose-gold)" }}
              >
                Próximo <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={onFinish}
                className="px-3 py-1.5 rounded-lg text-white text-sm"
                style={{ background: "var(--gradient-rose-gold)" }}
              >
                Concluir ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
