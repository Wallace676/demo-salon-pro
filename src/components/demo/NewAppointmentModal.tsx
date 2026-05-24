import { useMemo, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { addAppointment, servicesStore, appointmentsStore } from "@/lib/demoStore";
import { eligibleProfessionals, teamColor } from "@/lib/demoProfessionals";
import {
  dayTimeSlots,
  resolveDuration,
  unavailableSlots,
  validateAppointment,
} from "@/lib/scheduling";
import { toast } from "sonner";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const TIMES = dayTimeSlots();

export function NewAppointmentModal({ onClose }: { onClose: () => void }) {
  const services = servicesStore.use();
  const appts = appointmentsStore.use();
  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    service: services[0]?.name || "",
    professional: "",
    date: new Date().toISOString().slice(0, 10),
    time: "09:00",
    notes: "",
  });
  const profOptions = useMemo(() => eligibleProfessionals(form.service), [form.service]);
  const [err, setErr] = useState("");

  const duration = useMemo(
    () => resolveDuration({ service: form.service, professional: form.professional }),
    [form.service, form.professional],
  );

  const blocked = useMemo(
    () =>
      unavailableSlots({
        date: form.date,
        professional: form.professional || undefined,
        duration,
        list: appts,
      }),
    [form.date, form.professional, duration, appts],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) {
      setErr("Informe o telefone do cliente.");
      return;
    }
    const v = validateAppointment({
      clientName: form.clientName,
      service: form.service,
      date: form.date,
      time: form.time,
      professional: form.professional || undefined,
      duration,
    });
    if (!v.ok) {
      setErr(v.reason);
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
      professional: form.professional || undefined,
      duration,
    });
    toast.success("Agendamento confirmado! ✨");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-x-hidden">
      <div className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-md p-5 sm:p-6 relative animate-slide-up border border-border max-h-[92vh] overflow-y-auto overflow-x-hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-foreground mb-1">Novo Agendamento</h2>
        <p className="text-sm text-muted-foreground mb-5">Preencha os dados do cliente.</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nome do cliente" value={form.clientName} onChange={(v) => { setForm({ ...form, clientName: v }); setErr(""); }} />
          <Field label="Telefone" value={form.phone} onChange={(v) => setForm({ ...form, phone: maskPhone(v) })} placeholder="(11) 99999-9999" />
          <div>
            <label className="text-sm font-medium text-foreground">Serviço</label>
            <select
              value={form.service}
              onChange={(e) => { setForm({ ...form, service: e.target.value, professional: "" }); setErr(""); }}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name} — R$ {s.price}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Profissional</label>
            <select
              value={form.professional}
              onChange={(e) => { setForm({ ...form, professional: e.target.value }); setErr(""); }}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
            >
              <option value="">Qualquer profissional disponível</option>
              {profOptions.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
            {form.professional && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-5 h-5 rounded-full inline-flex items-center justify-center text-white text-[10px] font-bold" style={{ background: teamColor(form.professional) }}>{form.professional.charAt(0)}</span>
                Atendimento com {form.professional} • {duration}min
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Data</label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => { setForm({ ...form, date: e.target.value }); setErr(""); }}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Horário</label>
              <select
                value={form.time}
                onChange={(e) => { setForm({ ...form, time: e.target.value }); setErr(""); }}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              >
                {TIMES.map((t) => {
                  const isBlocked = blocked.has(t);
                  return (
                    <option key={t} value={t} disabled={isBlocked}>
                      {t}{isBlocked ? " — ocupado" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Visual availability strip */}
          <div>
            <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center justify-between">
              <span>Disponibilidade do dia</span>
              <span className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm" style={{ background: "oklch(0.88 0.10 145)" }} />livre</span>
                <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-sm" style={{ background: "oklch(0.85 0.10 25)" }} />ocupado</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TIMES.map((t) => {
                const isBlocked = blocked.has(t);
                const isSelected = t === form.time;
                return (
                  <button
                    type="button"
                    key={t}
                    disabled={isBlocked}
                    onClick={() => { setForm({ ...form, time: t }); setErr(""); }}
                    className="text-[10px] px-1.5 py-1 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: isSelected
                        ? "var(--gradient-rose-gold)"
                        : isBlocked
                          ? "oklch(0.95 0.04 25)"
                          : "oklch(0.96 0.04 145)",
                      color: isSelected ? "white" : isBlocked ? "oklch(0.45 0.12 25)" : "oklch(0.35 0.12 145)",
                      borderColor: isSelected ? "transparent" : "transparent",
                    }}
                    title={isBlocked ? "Horário ocupado" : "Disponível"}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Observações</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background resize-none" />
          </div>
          {err && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="min-w-0 break-words">{err}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-input font-medium">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-white font-semibold" style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}>
              Confirmar Agendamento
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
