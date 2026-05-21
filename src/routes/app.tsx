import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Painel — BellaSalon" }] }),
  component: AppDashboard,
});

type SalonRow = {
  id: string;
  name: string;
  owner_name: string | null;
  plan: string;
  city: string | null;
};

function AppDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [salon, setSalon] = useState<SalonRow | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) navigate({ to: "/" });
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (!data.session) navigate({ to: "/" });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("salons")
      .select("id,name,owner_name,plan,city")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setSalon(data);
      });
  }, [session]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!ready) return null;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-rose-gold)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">BellaSalon</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{session.user.email}</span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-foreground">
          Olá, {salon?.owner_name ?? "bem-vinda"}! ✨
        </h1>
        <p className="text-muted-foreground mt-1">
          Salão: <span className="font-semibold text-foreground">{salon?.name ?? "—"}</span> · Plano: {salon?.plan ?? "—"}
        </p>

        <div className="mt-8 p-6 rounded-2xl bg-card border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
          <h2 className="text-lg font-semibold text-foreground mb-2">Backend conectado ✅</h2>
          <p className="text-sm text-muted-foreground">
            Sua conta e seu salão estão salvos no banco com RLS ativo — apenas você vê seus dados.
            As próximas telas (agenda, clientes, equipe) vão consumir as tabelas já criadas.
          </p>
          <div className="mt-4">
            <Link
              to="/demo"
              className="inline-block px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: "var(--gradient-rose-gold)" }}
            >
              Ver demo enquanto isso
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
