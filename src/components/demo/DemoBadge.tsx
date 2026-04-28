import { Sparkles } from "lucide-react";

export function DemoBadge() {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-sm animate-pulse-soft"
      style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
    >
      <Sparkles className="w-4 h-4" />
      MODO DEMONSTRAÇÃO
    </div>
  );
}
