import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Inbox } from "lucide-react";
import { getLeads, leadsToCSV, type Lead } from "@/lib/demoData";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({ meta: [{ title: "Leads — Admin" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const downloadCSV = () => {
    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/demo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar à demo
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads capturados</h1>
            <p className="text-sm text-muted-foreground">{leads.length} contato{leads.length !== 1 ? "s" : ""} interessado{leads.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={downloadCSV}
            disabled={leads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {leads.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhum lead capturado ainda.</p>
            <p className="text-xs text-muted-foreground mt-1">Os leads aparecem aqui quando alguém preencher o formulário na demo.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--accent)" }}>
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold text-xs uppercase">Salão</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase">Responsável</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase">Cidade</th>
                  <th className="px-4 py-3 font-semibold text-xs uppercase">Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{l.salonName}</td>
                    <td className="px-4 py-3 text-foreground">{l.contactName}</td>
                    <td className="px-4 py-3 text-foreground">{l.whatsapp}</td>
                    <td className="px-4 py-3 text-foreground">{l.city}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
