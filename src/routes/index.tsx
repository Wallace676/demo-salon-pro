import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, MessageCircle, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BellaSalon — Sistema de Gestão para Salões" },
      { name: "description", content: "Gestão completa do seu salão com bot WhatsApp 24h. Veja a demonstração gratuita." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vinda de volta!");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-rose-soft)" }}>
      <div className="w-full max-w-md bg-card rounded-2xl p-8 animate-fade-in" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-rose-gold)" }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">BellaSalon</h1>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-8">Sistema de gestão para seu salão</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              placeholder="seu@salao.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium disabled:opacity-60"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Não tem conta?{" "}
          <Link to="/signup" className="font-semibold" style={{ color: "var(--rose-gold-dark)" }}>
            Criar conta grátis
          </Link>
        </p>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Link
          to="/demo"
          className="block w-full text-center py-2.5 rounded-lg border-2 font-medium transition-colors hover:bg-accent"
          style={{ borderColor: "var(--rose-gold)", color: "var(--rose-gold-dark)" }}
        >
          ✨ Ver Demo (sem login)
        </Link>

        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <Feature icon={<Calendar className="w-4 h-4" />} label="Agenda" />
          <Feature icon={<MessageCircle className="w-4 h-4" />} label="Bot 24h" />
          <Feature icon={<TrendingUp className="w-4 h-4" />} label="Relatórios" />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-muted-foreground">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)", color: "var(--rose-gold-dark)" }}>
        {icon}
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
