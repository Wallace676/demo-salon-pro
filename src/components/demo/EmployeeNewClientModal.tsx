import { useState } from "react";
import { X } from "lucide-react";
import { addAppointment, servicesStore } from "@/lib/demoStore";
import { upsertClientVisit } from "@/lib/clientMemory";
import { EMPLOYEE_NAME } from "@/lib/demoProfile";
import { toast } from "sonner";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const TIMES = (() => {
  const out: string[] = [];
  for (let h = 8; h <= 20; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 20) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

const RETURN_PRESETS: { label: string; days: number }[] = [
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "3 semanas", days: 21 },
  { label: "1 mês", days: 30 },
];

export function EmployeeNewClientModal({ onClose }: { onClose: () => void }) {
  const services = servicesStore.use();
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    service: services[0]?.name || "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    notes: "",
  });
  const [scheduleReturn, setScheduleReturn] = useState(false);
  const [returnDays, setReturnDays] = useState(21);
  const [customReturn, setCustomReturn] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.phone.trim() || !form.service) {
      setErr("Preencha nome, telefone e serviço");
      return;
    }
    const svc = services.find((s) => s.name === form.service);
    addAppointment({
      clientName: form.clientName.trim(),
      phone: form.phone,
      service: form.service,
      price: svc?.price || 0,
      date: form.date,
      time: form.time,
      notes: form.notes,
    });
    upsertClientVisit({
      clientName: form.clientName.trim(),
      service: form.service,
      professional: EMPLOYEE_NAME,
      date: form.date,
      note: form.notes || undefined,
    });
    if (scheduleReturn) {
      const next = new Date(form.date + "T00:00:00");
      next.setDate(next.getDate() + returnDays);
      toast.success(`Atendimento registrado! ✅ Retorno previsto ${next.toLocaleDateString("pt-BR")}`);
    } else {
      toast.success("Atendimento registrado! ✅");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div
        className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-md p-6 relative animate-slide-up border border-border max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-foreground mb-1">Adicionar Cliente Manual</h2>
        <p className="text-sm text-muted-foreground mb-5">Registre um atendimento que você fez fora do app.</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nome da cliente" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} />
          <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: maskPhone(v) })} placeholder="(11) 99999-9999" />
          <div>
            <label className="text-sm font-medium text-foreground">Serviço realizado</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name} — R$ {s.price}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Data</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Horário</label>
              <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background">
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Profissional</label>
            <input
              value={EMPLOYEE_NAME}
              disabled
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Observações</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Ex: Prefere esmalte nude, alérgica a acetona..."
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background resize-none"
            />
          </div>

          <div className="rounded-lg p-3 border border-border" style={{ background: "var(--accent)" }}>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-foreground">Agendar retorno?</span>
              <button
                type="button"
                onClick={() => setScheduleReturn(!scheduleReturn)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ background: scheduleReturn ? "var(--gradient-rose-gold)" : "var(--secondary)" }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: scheduleReturn ? "translateX(24px)" : "translateX(4px)" }}
                />
              </button>
            </label>
            {scheduleReturn && (
              <div className="mt-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2">Próximo retorno estimado em:</p>
                <div className="flex flex-wrap gap-1.5">
                  {RETURN_PRESETS.map((p) => {
                    const active = !customReturn && returnDays === p.days;
                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => { setReturnDays(p.days); setCustomReturn(false); }}
                        className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                        style={
                          active
                            ? { background: "var(--gradient-rose-gold)", color: "white" }
                            : { background: "white", border: "1px solid var(--border)", color: "var(--foreground)" }
                        }
                      >
                        {p.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCustomReturn(true)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={
                      customReturn
                        ? { background: "var(--gradient-rose-gold)", color: "white" }
                        : { background: "white", border: "1px solid var(--border)", color: "var(--foreground)" }
                    }
                  >
                    Personalizado
                  </button>
                </div>
                {customReturn && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={returnDays}
                      onChange={(e) => setReturnDays(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-2 py-1 rounded-md border border-input bg-background text-sm"
                    />
                    <span className="text-xs text-muted-foreground">dias</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-input font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-white font-semibold"
              style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
            >
              Salvar atendimento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background" />
    </div>
  );
}
