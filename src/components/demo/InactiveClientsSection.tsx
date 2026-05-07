import { useState } from "react";
import { MessageSquare, CalendarPlus } from "lucide-react";
import { INACTIVE_CLIENTS, statusFor, type InactiveClient } from "@/lib/inactiveClients";
import { ReturnMessageModal } from "./ReturnMessageModal";
import { toast } from "sonner";

export function InactiveClientsSection() {
  const [msgFor, setMsgFor] = useState<InactiveClient | null>(null);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          😴 Clientes Sumidas
        </h2>
        <p className="text-xs text-muted-foreground">
          Clientes que estão há tempos sem visitar — reative o relacionamento.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INACTIVE_CLIENTS.map((c) => {
          const s = statusFor(c.daysSinceLast);
          const overdue = c.daysSinceLast - c.averageReturnDays;
          return (
            <div
              key={c.name}
              className="rounded-xl p-4 border bg-card"
              style={{ borderColor: s.color, boxShadow: `0 0 0 1px ${s.bg}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  {s.emoji} {s.label.toUpperCase()}
                </span>
                <span className="text-[11px] text-muted-foreground">{c.totalVisits} visitas</span>
              </div>

              <div className="font-semibold text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Último: {c.lastService} • com {c.professional}
              </div>
              <div className="text-xs mt-1" style={{ color: s.color }}>
                Última visita: {c.daysSinceLast} dias atrás
              </div>

              <div className="mt-3 rounded-lg p-2.5 text-[11px]" style={{ background: s.bg, color: s.color }}>
                💡 {c.name.split(" ")[0]} costumava vir a cada {c.averageReturnDays} dias.
                {overdue > 0 ? ` Está ${overdue} dias atrasada!` : ""}
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setMsgFor(c)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "var(--gradient-rose-gold)" }}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Mandar mensagem
                </button>
                <button
                  onClick={() => toast.success(`Sugestão enviada para ${c.name.split(" ")[0]}`)}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-accent"
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Sugerir
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {msgFor && <ReturnMessageModal client={msgFor} onClose={() => setMsgFor(null)} />}
    </div>
  );
}
