import { useState } from "react";
import { X, CheckCircle2, Lock, Rocket } from "lucide-react";
import { Confetti } from "./Confetti";
import { addLead, PLANO_OPTIONS, COMO_ENCONTROU_OPTIONS } from "@/lib/leadsStore";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const FIELD_LABELS: Record<string, string> = {
  nomeSalao: "Nome do salão",
  nomeResponsavel: "Seu nome",
  whatsapp: "WhatsApp",
  cidade: "Cidade e Estado",
};

export function ExitDemoModal({ onClose, plan }: { onClose: () => void; plan?: string }) {
  const [form, setForm] = useState({
    nomeSalao: "",
    nomeResponsavel: "",
    whatsapp: "",
    cidade: "",
    plano: plan || PLANO_OPTIONS[1].value,
    comoEncontrou: COMO_ENCONTROU_OPTIONS[0],
  });
  const [done, setDone] = useState(false);
  const [savedPhone, setSavedPhone] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof form)[] = ["nomeSalao", "nomeResponsavel", "whatsapp", "cidade"];
    for (const k of required) {
      if (!form[k].trim()) {
        setErr(`Por favor preencha: ${FIELD_LABELS[k]}`);
        return;
      }
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      setErr("WhatsApp inválido");
      return;
    }
    setErr("");
    addLead(form);
    setSavedPhone(form.whatsapp);
    setDone(true);
  };

  return (
    <>
      {done && <Confetti duration={3000} />}
      <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
        <div
          className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-lg p-6 relative animate-slide-up border border-border max-h-[92vh] overflow-y-auto"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>

          {done ? (
            <div className="text-center py-6">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl animate-pulse-soft"
                style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
              >
                🎉
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Recebemos seu contato!</h2>
              <p className="text-muted-foreground mb-2">
                Entraremos em contato com você em até 2 horas pelo WhatsApp:
              </p>
              <p className="font-semibold text-foreground mb-5">{savedPhone}</p>
              <p className="text-sm text-muted-foreground mb-6">
                Enquanto isso, que tal explorar mais a demo? 😊
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-transform hover:scale-[1.02]"
                style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
              >
                <CheckCircle2 className="w-4 h-4" /> Continuar explorando →
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Vamos transformar seu salão! 💛</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Preencha seus dados e entraremos em contato em até 2 horas
              </p>
              <form onSubmit={submit} className="space-y-3">
                <Field label="Nome do salão *" value={form.nomeSalao} onChange={(v) => setForm({ ...form, nomeSalao: v })} placeholder="Ex: Espaço Bella" />
                <Field label="Seu nome *" value={form.nomeResponsavel} onChange={(v) => setForm({ ...form, nomeResponsavel: v })} placeholder="Como você se chama?" />
                <Field
                  label="WhatsApp *"
                  value={form.whatsapp}
                  onChange={(v) => setForm({ ...form, whatsapp: maskPhone(v) })}
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                />
                <Field label="Cidade e Estado *" value={form.cidade} onChange={(v) => setForm({ ...form, cidade: v })} placeholder="Ex: Rio de Janeiro - RJ" />

                <SelectField
                  label="Plano de interesse"
                  value={form.plano}
                  onChange={(v) => setForm({ ...form, plano: v })}
                  options={PLANO_OPTIONS}
                />

                <SelectField
                  label="Como nos encontrou?"
                  value={form.comoEncontrou}
                  onChange={(v) => setForm({ ...form, comoEncontrou: v })}
                  options={COMO_ENCONTROU_OPTIONS.map((o) => ({ value: o, label: o }))}
                />

                {err && (
                  <p className="text-sm font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-semibold mt-2 transition-transform hover:scale-[1.02] inline-flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
                >
                  <Rocket className="w-4 h-4" /> Quero meu sistema agora! 🚀
                </button>
                <p className="text-xs text-center text-muted-foreground inline-flex items-center justify-center gap-1 w-full">
                  <Lock className="w-3 h-3" /> Seus dados estão seguros. Não enviamos spam.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "tel" | "text";
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={120}
        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
        style={{ "--tw-ring-color": "var(--rose-gold)" } as React.CSSProperties}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-offset-1 transition"
        style={{ "--tw-ring-color": "var(--rose-gold)" } as React.CSSProperties}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
