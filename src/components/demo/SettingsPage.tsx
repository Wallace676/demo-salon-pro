import { useEffect, useRef, useState } from "react";
import { Download, Inbox, Upload, Check } from "lucide-react";
import { useSettings, updateSettings, THEME_OPTIONS, DAYS, type ThemeName } from "@/lib/demoSettings";
import { getLeads, leadsToCSV, type Lead } from "@/lib/demoData";
import { toast } from "sonner";

export function SettingsPage() {
  const settings = useSettings();
  const [leads, setLeads] = useState<Lead[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLeads(getLeads()); }, []);

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 1024 * 1024) { toast.error("Imagem muito grande (máx 1MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      updateSettings({ logoDataUrl: String(reader.result) });
      toast.success("Logo atualizado!");
    };
    reader.readAsDataURL(f);
  };

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
    <div className="w-full max-w-full overflow-x-hidden space-y-6 animate-fade-in md:max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm">Personalize seu salão.</p>
      </div>

      {/* Branding */}
      <Section title="Marca">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Nome do salão</label>
            <input
              value={settings.salonName}
              onChange={(e) => updateSettings({ salonName: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Nome da proprietária</label>
            <input
              value={settings.ownerName}
              onChange={(e) => updateSettings({ ownerName: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center text-white text-2xl font-bold" style={{ borderColor: "var(--rose-gold)", background: settings.logoDataUrl ? undefined : "var(--gradient-rose-gold)" }}>
            {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt="Logo" className="w-full h-full object-cover" /> : settings.salonName.charAt(0)}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onLogo} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-input text-sm hover:bg-accent">
              <Upload className="w-4 h-4" /> Enviar logo
            </button>
            {settings.logoDataUrl && (
              <button onClick={() => updateSettings({ logoDataUrl: null })} className="ml-2 text-xs text-muted-foreground hover:text-destructive">
                Remover
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Theme */}
      <Section title="Tema de cores">
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => { updateSettings({ theme: t.value as ThemeName }); toast.success(`Tema ${t.label} aplicado!`); }}
              className="relative rounded-xl p-4 text-white font-semibold text-sm transition-transform hover:scale-105"
              style={{ background: t.preview }}
            >
              {settings.theme === t.value && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Hours */}
      <Section title="Horário de funcionamento">
        <div className="space-y-2">
          {DAYS.map((d) => {
            const h = settings.hours[d];
            return (
              <div key={d} className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 w-20">
                  <input
                    type="checkbox"
                    checked={h.open}
                    onChange={(e) => updateSettings({ hours: { ...settings.hours, [d]: { ...h, open: e.target.checked } } })}
                  />
                  <span className="font-medium text-sm">{d}</span>
                </label>
                <input
                  type="time"
                  disabled={!h.open}
                  value={h.from}
                  onChange={(e) => updateSettings({ hours: { ...settings.hours, [d]: { ...h, from: e.target.value } } })}
                  className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50"
                />
                <span className="text-muted-foreground text-sm">até</span>
                <input
                  type="time"
                  disabled={!h.open}
                  value={h.to}
                  onChange={(e) => updateSettings({ hours: { ...settings.hours, [d]: { ...h, to: e.target.value } } })}
                  className="px-2 py-1 rounded border border-input bg-background text-sm disabled:opacity-50"
                />
                {!h.open && <span className="text-xs text-muted-foreground">Fechado</span>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Leads */}
      <Section title={`Leads capturados (${leads.length})`} action={
        <button
          onClick={downloadCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50"
          style={{ background: "var(--gradient-rose-gold)" }}
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      }>
        {leads.length === 0 ? (
          <div className="text-center py-10">
            <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum lead capturado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--accent)" }}>
                <tr className="text-left">
                  <th className="px-4 py-2 font-semibold text-xs uppercase">Salão</th>
                  <th className="px-4 py-2 font-semibold text-xs uppercase">Responsável</th>
                  <th className="px-4 py-2 font-semibold text-xs uppercase">WhatsApp</th>
                  <th className="px-4 py-2 font-semibold text-xs uppercase">Cidade</th>
                  <th className="px-4 py-2 font-semibold text-xs uppercase">Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{l.salonName}</td>
                    <td className="px-4 py-2">{l.contactName}</td>
                    <td className="px-4 py-2">{l.whatsapp}</td>
                    <td className="px-4 py-2">{l.city}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(l.createdAt).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}
