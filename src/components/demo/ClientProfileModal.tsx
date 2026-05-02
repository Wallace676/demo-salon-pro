import { useState } from "react";
import { X, Sparkles, Bell, Plus, Trash2, MessageCircle } from "lucide-react";
import {
  useClientMemory,
  addClientTag,
  removeClientTag,
  setClientMemory,
  buildScheduledMessages,
  type ClientMemory,
} from "@/lib/clientMemory";

export function ClientProfileModal({
  clientName,
  onClose,
}: {
  clientName: string;
  onClose: () => void;
}) {
  const all = useClientMemory();
  const mem: ClientMemory =
    all[clientName] || {
      clientName,
      tags: [],
      history: [],
      remindersEnabled: false,
    };
  const messages = buildScheduledMessages(mem);
  const [newTag, setNewTag] = useState("");

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-2xl p-6 relative animate-slide-up border border-border max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            {clientName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{clientName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Histórico Inteligente
            </p>
          </div>
        </div>

        {/* Last service */}
        {mem.lastService ? (
          <div
            className="rounded-xl p-4 mb-4 border"
            style={{ background: "oklch(0.98 0.02 25)", borderColor: "var(--rose-gold)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--rose-gold-dark)" }}>
              💅 Último atendimento
            </div>
            <div className="text-sm text-foreground">
              {mem.lastService.service} com {mem.lastService.professional}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(mem.lastService.date + "T00:00:00").toLocaleDateString("pt-BR")}
            </div>
            {mem.lastService.polish && (
              <div className="text-sm text-foreground mt-1">Esmalte: {mem.lastService.polish}</div>
            )}
            {mem.lastService.note && (
              <div className="text-sm text-muted-foreground mt-1">Observação: {mem.lastService.note}</div>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-4 mb-4 border border-border bg-accent text-sm text-muted-foreground">
            Sem atendimentos registrados ainda.
          </div>
        )}

        {/* Tags */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground text-sm mb-2">Preferências</h3>
          <div className="flex flex-wrap gap-1.5">
            {mem.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium"
                style={{ background: "var(--accent)", color: "var(--foreground)" }}
              >
                {t}
                <button
                  onClick={() => removeClientTag(clientName, t)}
                  className="w-4 h-4 rounded-full hover:bg-background flex items-center justify-center"
                  aria-label="Remover"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
            {mem.tags.length === 0 && (
              <span className="text-xs text-muted-foreground">Sem preferências cadastradas.</span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="+ Adicionar preferência"
              className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-sm"
            />
            <button
              onClick={() => {
                if (newTag.trim()) {
                  addClientTag(clientName, newTag.trim());
                  setNewTag("");
                }
              }}
              className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
              style={{ background: "var(--gradient-rose-gold)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pattern */}
        {mem.averageReturnDays && (
          <div
            className="rounded-xl p-4 mb-4 border border-border"
            style={{ background: "var(--accent)" }}
          >
            <div className="text-sm text-foreground">
              📊 <strong>Padrão de retorno:</strong> esta cliente costuma voltar em média a cada{" "}
              <span style={{ color: "var(--rose-gold-dark)" }} className="font-semibold">
                {mem.averageReturnDays} dias
              </span>
            </div>
          </div>
        )}

        {/* Auto messages toggle */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Bell className="w-4 h-4" /> 🤖 Mensagens automáticas
            </h3>
            <button
              onClick={() =>
                setClientMemory(clientName, { remindersEnabled: !mem.remindersEnabled })
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background: mem.remindersEnabled ? "var(--gradient-rose-gold)" : "var(--secondary)",
              }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{ transform: mem.remindersEnabled ? "translateX(24px)" : "translateX(4px)" }}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ativar lembretes baseados no padrão de retorno
          </p>
        </div>

        {/* Scheduled messages */}
        {mem.remindersEnabled && messages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Mensagens agendadas
            </h4>
            {messages.map((m) => (
              <div
                key={m.daysAfter}
                className="rounded-lg p-3 border border-border bg-card"
              >
                <div className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: "var(--rose-gold-dark)" }}>
                  {m.label} • envio {new Date(m.sendDate + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
                <div className="text-sm text-foreground whitespace-pre-line">{m.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
