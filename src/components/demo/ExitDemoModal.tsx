import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { saveLead } from "@/lib/demoData";
import { Confetti } from "./Confetti";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ExitDemoModal({ onClose, plan }: { onClose: () => void; plan?: string }) {
  const [form, setForm] = useState({ salonName: "", contactName: "", whatsapp: "", city: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.salonName.trim() || !form.contactName.trim() || !form.whatsapp.trim() || !form.city.trim()) {
      setErr("Preencha todos os campos");
      return;
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      setErr("WhatsApp inválido");
      return;
    }
    saveLead({ ...form, plan });
    setDone(true);
  };

  return (
    <>
      {done && <Confetti />}
      <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
        <div className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-md p-6 relative animate-slide-up border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>

          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse-soft" style={{ background: "var(--gradient-rose-gold)" }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Perfeito! 🎉</h2>
              <p className="text-muted-foreground mb-6">Entraremos em contato em até 2 horas! 💕</p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-white font-medium" style={{ background: "var(--gradient-rose-gold)" }}>
                Fechar
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Quero este sistema! ✨</h2>
              <p className="text-sm text-muted-foreground mb-5">Preencha e nosso time entrará em contato.</p>
              <form onSubmit={submit} className="space-y-3">
                <Field label="Nome do salão" value={form.salonName} onChange={(v) => setForm({ ...form, salonName: v })} placeholder="Salão Bella" />
                <Field label="Nome do responsável" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} placeholder="Maria Silva" />
                <Field
                  label="WhatsApp"
                  value={form.whatsapp}
                  onChange={(v) => setForm({ ...form, whatsapp: maskPhone(v) })}
                  placeholder="(11) 99999-9999"
                />
                <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="São Paulo" />
                {err && <p className="text-sm text-destructive">{err}</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg text-white font-semibold mt-2 transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
                >
                  Quero meu sistema! →
                </button>
                <p className="text-xs text-center text-muted-foreground">Entraremos em contato em até 2 horas!</p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-offset-1"
        style={{ "--tw-ring-color": "var(--rose-gold)" } as React.CSSProperties}
      />
    </div>
  );
}
