import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { InactiveClient } from "@/lib/inactiveClients";

type Template = "saudade" | "promocao" | "personalizada";

export function ReturnMessageModal({ client, onClose }: { client: InactiveClient; onClose: () => void }) {
  const [template, setTemplate] = useState<Template>("saudade");
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);

  const firstName = client.name.split(" ")[0];
  const messages: Record<Template, string> = {
    saudade: `Oi ${firstName}! 💛 Sentimos sua falta!\n\nFaz um tempinho que você não passa por aqui...\n\nQue tal agendar um horário essa semana? 😊`,
    promocao: `Oi ${firstName}! Temos uma surpresa especial pra você! 🎁\n\n${client.lastService} com 10% de desconto essa semana!\n\nQue tal voltar? 💅`,
    personalizada: custom || "Escreva sua mensagem...",
  };
  const text = messages[template];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-border"
        style={{ boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="font-bold text-foreground">Mensagem de Retorno</h2>
            <p className="text-xs text-muted-foreground">Para {client.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <TplBtn active={template === "saudade"} onClick={() => setTemplate("saudade")} label="💛 Saudade" />
            <TplBtn active={template === "promocao"} onClick={() => setTemplate("promocao")} label="🎁 Promoção" />
            <TplBtn active={template === "personalizada"} onClick={() => setTemplate("personalizada")} label="✏️ Personalizada" />
          </div>

          {template === "personalizada" && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={`Oi ${firstName}, ...`}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--rose-gold)]"
            />
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-2">Pré-visualização no WhatsApp</p>
            <div className="rounded-2xl p-4" style={{ background: "#e5ddd5" }}>
              <div className="ml-auto max-w-[85%] px-3 py-2 rounded-lg rounded-br-sm text-sm whitespace-pre-line shadow-sm" style={{ background: "#dcf8c6" }}>
                {text}
              </div>
            </div>
          </div>

          <button
            onClick={copy}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-[1.01]"
            style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado!" : "📋 Copiar mensagem"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TplBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={
        active
          ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
          : { background: "var(--secondary)", color: "var(--foreground)" }
      }
    >
      {label}
    </button>
  );
}
