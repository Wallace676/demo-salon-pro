import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Calendar,
  Users,
  MessageCircle,
  TrendingUp,
  LayoutDashboard,
  Clock,
  DollarSign,
  ArrowRight,
  Play,
} from "lucide-react";
import { DemoBadge } from "@/components/demo/DemoBadge";
import { DemoTour, type TourStep } from "@/components/demo/DemoTour";
import { ExitDemoModal } from "@/components/demo/ExitDemoModal";
import { WhatsAppSimulation } from "@/components/demo/WhatsAppSimulation";
import { DEMO_CLIENTS, DEMO_SERVICES, DEMO_APPOINTMENTS, DEMO_STATS } from "@/lib/demoData";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demonstração — BellaSalon" },
      { name: "description", content: "Veja seu salão funcionando no automático. Sistema completo + Bot WhatsApp 24h." },
      { property: "og:title", content: "Demonstração BellaSalon" },
      { property: "og:description", content: "Sistema completo de gestão + Bot WhatsApp 24h." },
    ],
  }),
  component: DemoPage,
});

const TOUR_STEPS: TourStep[] = [
  { targetId: "tour-dashboard", title: "Este é seu Dashboard", description: "Veja tudo em tempo real: agendamentos, faturamento, clientes ativos." },
  { targetId: "tour-appointments", title: "Agendamentos do dia", description: "Aqui ficam seus agendamentos do dia, organizados por horário." },
  { targetId: "tour-clients", title: "Gestão de Clientes", description: "Gerencie seus clientes e veja todo o histórico de visitas." },
  { targetId: "tour-bot", title: "Bot WhatsApp 24h", description: "Seu bot ativo 24h respondendo clientes e agendando automaticamente." },
  { targetId: "tour-reports", title: "Relatórios", description: "Relatórios e faturamento sempre atualizados em tempo real." },
];

type Tab = "dashboard" | "appointments" | "clients" | "bot" | "reports";

function DemoPage() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [tourActive, setTourActive] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  if (!started) return <Landing onStart={() => { setStarted(true); setTimeout(() => setTourActive(true), 400); }} />;

  return (
    <div className="min-h-screen bg-background">
      <DemoBadge />

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-rose-gold)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">BellaSalon</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <NavItem id="tour-dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavItem>
            <NavItem id="tour-appointments" active={tab === "appointments"} onClick={() => setTab("appointments")} icon={<Calendar className="w-4 h-4" />}>Agendamentos</NavItem>
            <NavItem id="tour-clients" active={tab === "clients"} onClick={() => setTab("clients")} icon={<Users className="w-4 h-4" />}>Clientes</NavItem>
            <NavItem id="tour-bot" active={tab === "bot"} onClick={() => setTab("bot")} icon={<MessageCircle className="w-4 h-4" />}>Bot WhatsApp</NavItem>
            <NavItem id="tour-reports" active={tab === "reports"} onClick={() => setTab("reports")} icon={<TrendingUp className="w-4 h-4" />}>Relatórios</NavItem>
          </nav>
          <div className="p-3 border-t border-border space-y-2">
            <Link to="/admin/leads" className="block text-xs text-center text-muted-foreground hover:text-foreground">
              Configurações
            </Link>
            <button
              onClick={() => setExitOpen(true)}
              className="w-full px-3 py-2.5 rounded-lg text-white font-medium text-sm"
              style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
            >
              Quero este sistema!
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {/* Mobile tabs */}
          <div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-2">
            {(["dashboard", "appointments", "clients", "bot", "reports"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${tab === t ? "text-white" : "bg-secondary text-foreground"}`}
                style={tab === t ? { background: "var(--gradient-rose-gold)" } : undefined}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "dashboard" && <Dashboard />}
          {tab === "appointments" && <Appointments />}
          {tab === "clients" && <Clients />}
          {tab === "bot" && <BotPage />}
          {tab === "reports" && <Reports />}

          <div className="md:hidden mt-6">
            <button
              onClick={() => setExitOpen(true)}
              className="w-full px-4 py-3 rounded-lg text-white font-semibold"
              style={{ background: "var(--gradient-rose-gold)" }}
            >
              Quero este sistema para meu salão →
            </button>
          </div>
        </main>
      </div>

      {tourActive && <DemoTour steps={TOUR_STEPS} onFinish={() => setTourActive(false)} />}
      {exitOpen && <ExitDemoModal onClose={() => setExitOpen(false)} />}
    </div>
  );
}

function NavItem({
  id,
  active,
  onClick,
  icon,
  children,
}: {
  id?: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? "text-white" : "text-foreground hover:bg-accent"
      }`}
      style={active ? { background: "var(--gradient-rose-gold)" } : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 text-center" style={{ background: "var(--gradient-rose-soft)" }}>
      <div className="max-w-3xl animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: "white", color: "var(--rose-gold-dark)", boxShadow: "var(--shadow-rose)" }}>
          <Sparkles className="w-3 h-3" />
          Demonstração interativa gratuita
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          Veja seu salão funcionando<br />
          <span style={{ background: "var(--gradient-rose-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            no automático
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Sistema completo de gestão + Bot WhatsApp 24h
        </p>

        {/* Preview mockup */}
        <div className="relative mx-auto max-w-2xl mb-10 animate-float">
          <div className="bg-card rounded-2xl p-4 text-left" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <div className="flex gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--rose-gold-light)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--whatsapp)", opacity: 0.6 }} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Hoje" value="8" />
              <MiniStat label="Clientes" value="47" />
              <MiniStat label="Mês" value="R$4.380" />
            </div>
            <div className="mt-3 h-24 rounded-lg" style={{ background: "var(--gradient-rose-soft)" }} />
          </div>
        </div>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-transform hover:scale-105"
          style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-elegant)" }}
        >
          <Play className="w-5 h-5" />
          Iniciar Demonstração Gratuita
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-xs text-muted-foreground mt-4">Sem cadastro • Sem cartão de crédito</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: "var(--gradient-rose-soft)" }}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-bold text-foreground">{value}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, Bella! 👋</h1>
        <p className="text-muted-foreground text-sm">Aqui está o resumo do seu salão hoje.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar />} label="Agendamentos hoje" value={String(DEMO_STATS.todayAppointments)} accent />
        <StatCard icon={<Users />} label="Clientes ativos" value={String(DEMO_STATS.activeClients)} />
        <StatCard icon={<DollarSign />} label="Faturamento do mês" value={`R$ ${DEMO_STATS.monthlyRevenue.toLocaleString("pt-BR")}`} />
        <StatCard icon={<TrendingUp />} label="Taxa de retorno" value={`${DEMO_STATS.returnRate}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3">Próximos agendamentos</h2>
          <div className="space-y-2">
            {DEMO_APPOINTMENTS.filter((a) => a.isToday).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: "var(--gradient-rose-gold)" }}>
                  {a.clientName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-foreground">{a.clientName}</div>
                  <div className="text-xs text-muted-foreground">{a.service}</div>
                </div>
                <div className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {a.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3">Bot WhatsApp</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ background: "var(--whatsapp)" }} />
            <span className="text-sm text-foreground">Online agora</span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Mensagens hoje" value="34" />
            <Row label="Agendamentos via bot" value="6" />
            <Row label="Tempo de resposta" value="< 2s" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-xl p-4 border border-border"
      style={accent ? { background: "var(--gradient-rose-gold)", color: "white", border: "none" } : { background: "var(--card)" }}
    >
      <div className={accent ? "opacity-90" : "text-muted-foreground"}>
        <div className="w-8 h-8">{icon}</div>
      </div>
      <div className={`text-2xl font-bold mt-2 ${accent ? "" : "text-foreground"}`}>{value}</div>
      <div className={`text-xs ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
    </div>
  );
}

function Appointments() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Agendamentos da semana</h1>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--accent)" }}>
            <tr className="text-left">
              <Th>Cliente</Th><Th>Serviço</Th><Th>Dia</Th><Th>Horário</Th><Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {DEMO_APPOINTMENTS.slice(0, 20).map((a) => (
              <tr key={a.id} className="border-t border-border">
                <Td>{a.clientName}</Td>
                <Td>{a.service}</Td>
                <Td>{a.day} {a.date}</Td>
                <Td>{a.time}</Td>
                <Td className="font-medium">R$ {a.price}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-foreground ${className}`}>{children}</td>;
}

function Clients() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEMO_CLIENTS.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-4 border border-border flex gap-3 items-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "var(--gradient-rose-gold)" }}>
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.phone}</div>
              <div className="text-xs mt-1" style={{ color: "var(--rose-gold-dark)" }}>
                {c.visits} visitas • {c.lastVisit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BotPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bot WhatsApp</h1>
        <p className="text-muted-foreground text-sm">Veja seu bot atendendo clientes em tempo real.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <WhatsAppSimulation />
        <div className="space-y-3">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-2">✨ O que seu bot faz</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Atende clientes 24h, todos os dias</li>
              <li>✅ Agenda automaticamente nos horários livres</li>
              <li>✅ Envia lembretes antes do horário</li>
              <li>✅ Confirma e remarca compromissos</li>
              <li>✅ Mostra serviços e preços</li>
              <li>✅ Nunca perde uma oportunidade</li>
            </ul>
          </div>
          <div className="rounded-xl p-5 text-white" style={{ background: "var(--gradient-rose-gold)" }}>
            <div className="text-3xl font-bold">+38%</div>
            <div className="text-sm opacity-90">de agendamentos em média no primeiro mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const totalRevenue = DEMO_APPOINTMENTS.reduce((s, a) => s + a.price, 0);
  const byService = DEMO_SERVICES.map((s) => {
    const count = DEMO_APPOINTMENTS.filter((a) => a.service === s.name).length;
    return { ...s, count, total: count * s.price };
  }).sort((a, b) => b.total - a.total);
  const max = Math.max(...byService.map((s) => s.total), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={<DollarSign />} label="Faturamento da semana" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`} accent />
        <StatCard icon={<Calendar />} label="Total agendamentos" value={String(DEMO_APPOINTMENTS.length)} />
        <StatCard icon={<TrendingUp />} label="Ticket médio" value={`R$ ${Math.round(totalRevenue / DEMO_APPOINTMENTS.length)}`} />
      </div>
      <div className="bg-card rounded-xl p-5 border border-border">
        <h2 className="font-semibold text-foreground mb-4">Serviços mais lucrativos</h2>
        <div className="space-y-3">
          {byService.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground">{s.name} <span className="text-muted-foreground">({s.count}x)</span></span>
                <span className="font-medium text-foreground">R$ {s.total.toLocaleString("pt-BR")}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(s.total / max) * 100}%`, background: "var(--gradient-rose-gold)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
