import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

export function EmployeeNotification() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div
      className="relative rounded-xl p-5 border-2 animate-scale-in"
      style={{
        borderColor: "var(--rose-gold)",
        background: "linear-gradient(180deg, rgba(255,182,193,0.08), var(--card))",
        boxShadow: "var(--shadow-rose)",
        animation: "scale-in 0.3s ease-out, pulse-soft 2s ease-in-out 0.3s 2",
      }}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-accent text-muted-foreground"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white animate-pulse-soft"
          style={{ background: "var(--gradient-rose-gold)" }}
        >
          <Bell className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-foreground">🔔 Novo Agendamento!</h3>
      </div>

      <div className="space-y-1.5 text-sm text-foreground mb-4 pl-1">
        <div>👤 <span className="text-muted-foreground">Cliente:</span> <span className="font-medium">Juliana Costa</span></div>
        <div>✂️ <span className="text-muted-foreground">Serviço:</span> <span className="font-medium">Coloração</span></div>
        <div>⏰ <span className="text-muted-foreground">Horário:</span> <span className="font-medium">Hoje às 15h30</span></div>
        <div>💰 <span className="text-muted-foreground">Valor:</span> <span className="font-medium">R$ 180</span></div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            toast.success("Confirmado! Cliente notificada ✅");
            setDismissed(true);
          }}
          className="flex-1 py-2 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-[1.02]"
          style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
        >
          ✅ Confirmar
        </button>
        <button
          onClick={() => {
            toast("Solicitação de remarcação enviada");
            setDismissed(true);
          }}
          className="flex-1 py-2 rounded-lg font-semibold text-sm border border-border bg-background hover:bg-accent transition-colors"
        >
          🔄 Remarcar
        </button>
      </div>
    </div>
  );
}
