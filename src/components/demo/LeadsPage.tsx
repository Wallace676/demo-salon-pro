import { useMemo, useState } from "react";
import { Download, MessageCircle, Trash2, X, Search } from "lucide-react";
import { toast } from "sonner";
import {
  useLeads,
  leadsToCSV,
  leadsStats,
  STATUS_LABEL,
  updateLeadStatus,
  deleteLead,
  updateLeadNotes,
  markLeadRead,
  type Lead,
  type LeadStatus,
} from "@/lib/leadsStore";

type Filter = "todos" | LeadStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "novo", label: "Novos 🔴" },
  { value: "em_contato", label: "Em contato 🟡" },
  { value: "convertido", label: "Convertido ✅" },
  { value: "perdido", label: "Perdido ❌" },
];

const STATUS_COLORS: Record<LeadStatus, { bg: string; fg: string }> = {
  novo: { bg: "oklch(0.93 0.06 25)", fg: "oklch(0.45 0.20 25)" },
  em_contato: { bg: "oklch(0.95 0.10 90)", fg: "oklch(0.45 0.15 70)" },
  convertido: { bg: "oklch(0.92 0.10 145)", fg: "oklch(0.35 0.15 145)" },
  perdido: { bg: "oklch(0.92 0.02 25)", fg: "oklch(0.40 0.05 25)" },
};

export function LeadsPage() {
  const leads = useLeads();
  const [filter, setFilter] = useState<Filter>("todos");
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const stats = useMemo(() => leadsStats(leads), [leads]);

  const filtered = useMemo(() => {
    let arr = leads;
    if (filter !== "todos") arr = arr.filter((l) => l.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (l) =>
          l.nomeSalao.toLowerCase().includes(q) ||
          l.nomeResponsavel.toLowerCase().includes(q) ||
          l.whatsapp.includes(q) ||
          l.cidade.toLowerCase().includes(q),
      );
    }
    return arr;
  }, [leads, filter, query]);

  const openLead = useMemo(() => leads.find((l) => l.id === openId) ?? null, [openId, leads]);

  const exportCSV = () => {
    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const copyWhats = (l: Lead) => {
    const firstName = l.nomeResponsavel.split(" ")[0];
    const msg = `Oi ${firstName}! Vi que você se interessou pelo sistema BellaSalon 💛\n\nPosso te mostrar como funciona? Tenho horário disponível hoje!`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(msg).catch(() => {});
    }
    toast.success("Mensagem copiada! Cole no WhatsApp 📋");
    const phone = l.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onChangeStatus = (id: number, status: LeadStatus) => {
    updateLeadStatus(id, status);
    toast.success("Status atualizado");
  };

  const onDelete = (id: number) => {
    if (confirm("Excluir este lead?")) {
      deleteLead(id);
      if (openId === id) setOpenId(null);
      toast("Lead excluído");
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads Capturados</h1>
          <p className="text-sm text-muted-foreground">Pessoas interessadas no seu sistema</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-50 transition-transform hover:scale-[1.02]"
          style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
        >
          <Download className="w-4 h-4" /> 📊 Exportar para CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total de leads" value={String(stats.total)} accent />
        <StatCard label="Novos hoje" value={String(stats.novosHoje)} />
        <StatCard label="Taxa de conversão" value={`${stats.conversao}%`} />
        <StatCard label="Receita potencial" value={`R$ ${stats.receitaPotencial.toLocaleString("pt-BR")}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const count = f.value === "todos" ? leads.length : leads.filter((l) => l.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                filter === f.value
                  ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
                  : { background: "var(--secondary)", color: "var(--foreground)" }
              }
            >
              {f.label} ({count})
            </button>
          );
        })}
        <div className="ml-auto relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar..."
            className="pl-7 pr-3 py-1.5 rounded-full border border-input bg-background text-xs focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "var(--rose-gold)" } as React.CSSProperties}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--accent)" }}>
            <tr className="text-left">
              <Th>Data</Th>
              <Th>Salão</Th>
              <Th>Responsável</Th>
              <Th>WhatsApp</Th>
              <Th>Plano</Th>
              <Th>Como achou</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr
                key={l.id}
                onClick={() => {
                  setOpenId(l.id);
                  if (!l.lido) markLeadRead(l.id);
                }}
                className="border-t border-border hover:bg-accent/40 cursor-pointer transition-colors"
                style={!l.lido ? { background: "oklch(0.97 0.025 25)" } : undefined}
              >
                <Td className="text-xs text-muted-foreground whitespace-nowrap">{l.dataHora}</Td>
                <Td className="font-medium">{l.nomeSalao}</Td>
                <Td>{l.nomeResponsavel}</Td>
                <Td className="whitespace-nowrap">{l.whatsapp}</Td>
                <Td className="text-xs">{l.plano.split("—")[0].trim()}</Td>
                <Td className="text-xs">{l.comoEncontrou}</Td>
                <Td>
                  <select
                    value={l.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChangeStatus(l.id, e.target.value as LeadStatus)}
                    className="text-[11px] font-semibold px-2 py-1 rounded-full border-0 cursor-pointer"
                    style={{
                      background: STATUS_COLORS[l.status].bg,
                      color: STATUS_COLORS[l.status].fg,
                    }}
                  >
                    <option value="novo">🔴 Novo</option>
                    <option value="em_contato">🟡 Em contato</option>
                    <option value="convertido">✅ Convertido</option>
                    <option value="perdido">❌ Perdido</option>
                  </select>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyWhats(l);
                      }}
                      className="p-1.5 rounded-md hover:bg-accent border border-border"
                      title="WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" style={{ color: "var(--whatsapp)" }} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(l.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground border border-border"
                      title="Excluir"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum lead encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openLead && <LeadDetailPanel lead={openLead} onClose={() => setOpenId(null)} onWhats={copyWhats} />}
    </div>
  );
}

function LeadDetailPanel({
  lead,
  onClose,
  onWhats,
}: {
  lead: Lead;
  onClose: () => void;
  onWhats: (l: Lead) => void;
}) {
  const [notes, setNotes] = useState(lead.notas || "");

  const saveNotes = () => {
    updateLeadNotes(lead.id, notes);
    toast.success("Observações salvas");
  };

  return (
    <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm flex justify-end animate-fade-in" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md h-full overflow-y-auto p-6 border-l border-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{lead.nomeSalao}</h2>
            <p className="text-sm text-muted-foreground">{lead.nomeResponsavel}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-sm mb-5">
          <Info label="WhatsApp" value={lead.whatsapp} />
          <Info label="Cidade" value={lead.cidade} />
          <Info label="Plano" value={lead.plano} />
          <Info label="Como encontrou" value={lead.comoEncontrou} />
          <Info label="Status" value={STATUS_LABEL[lead.status]} />
        </div>

        <button
          onClick={() => onWhats(lead)}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm inline-flex items-center justify-center gap-2 mb-5"
          style={{ background: "var(--whatsapp)" }}
        >
          <MessageCircle className="w-4 h-4" /> Abrir conversa no WhatsApp
        </button>

        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-1 block">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Adicione anotações sobre este lead..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "var(--rose-gold)" } as React.CSSProperties}
          />
          <button
            onClick={saveNotes}
            className="mt-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            Salvar
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Histórico</h3>
          <div className="space-y-2">
            {(lead.history ?? []).map((h, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--rose-gold)" }} />
                <div>
                  <div className="text-muted-foreground">{h.at}</div>
                  <div className="text-foreground">{h.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={
        accent
          ? { background: "var(--gradient-rose-gold)", color: "white", border: "none" }
          : { background: "var(--card)", borderColor: "var(--border)" }
      }
    >
      <div className={`text-2xl font-bold ${accent ? "" : "text-foreground"}`}>{value}</div>
      <div className={`text-xs ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2.5 font-semibold text-foreground text-[11px] uppercase tracking-wide whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 text-foreground ${className}`}>{children}</td>;
}
