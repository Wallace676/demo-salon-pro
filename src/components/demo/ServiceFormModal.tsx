import { useState } from "react";
import { X } from "lucide-react";
import { addService, updateService, type Service } from "@/lib/demoStore";
import { toast } from "sonner";

const CATEGORIES: Service["category"][] = ["Cabelo", "Unhas", "Estética", "Barba"];

export function ServiceFormModal({ initial, onClose }: { initial?: Service; onClose: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    category: initial?.category || ("Cabelo" as Service["category"]),
    price: initial?.price ?? 0,
    duration: initial?.duration ?? 30,
    description: initial?.description || "",
  });
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0 || form.duration <= 0) {
      setErr("Preencha todos os campos corretamente");
      return;
    }
    if (initial) {
      updateService(initial.id, form);
      toast.success("Serviço atualizado!");
    } else {
      addService(form);
      toast.success("Serviço criado! ✨");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card/95 backdrop-blur rounded-2xl w-full max-w-md p-6 relative animate-slide-up border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-foreground mb-5">{initial ? "Editar serviço" : "Novo serviço"}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Service["category"] })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Duração (min)</label>
              <input type="number" min={1} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Preço (R$)</label>
              <input type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background resize-none" />
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-input font-medium">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg text-white font-semibold" style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}>
              {initial ? "Salvar" : "Criar serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
