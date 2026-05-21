import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — BellaSalon" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [salonName, setSalonName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { salon_name: salonName, owner_name: ownerName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Confirme seu email para entrar.");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-rose-soft)" }}>
      <div className="w-full max-w-md bg-card rounded-2xl p-8 animate-fade-in" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-rose-gold)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-6">Comece a gerenciar seu salão</p>

        <form className="space-y-3" onSubmit={onSubmit}>
          <Field label="Nome do salão" value={salonName} onChange={setSalonName} required />
          <Field label="Seu nome" value={ownerName} onChange={setOwnerName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Senha" type="password" value={password} onChange={setPassword} required />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium disabled:opacity-60"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link to="/" className="font-semibold" style={{ color: "var(--rose-gold-dark)" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
      />
    </div>
  );
}
