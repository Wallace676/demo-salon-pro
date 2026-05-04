import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  Settings as SettingsIcon,
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Brain,
  Zap,
  MessageSquareHeart,
} from "lucide-react";
import { DemoBadge } from "@/components/demo/DemoBadge";
import { DemoTour, type TourStep } from "@/components/demo/DemoTour";
import { ExitDemoModal } from "@/components/demo/ExitDemoModal";
import { MariSimulation } from "@/components/demo/MariSimulation";
import { NewAppointmentModal } from "@/components/demo/NewAppointmentModal";
import { ServiceFormModal } from "@/components/demo/ServiceFormModal";
import { SettingsPage } from "@/components/demo/SettingsPage";
import { Confetti } from "@/components/demo/Confetti";
import { DEMO_CLIENTS, DEMO_STATS } from "@/lib/demoData";
import { useSettings } from "@/lib/demoSettings";
import { useProfile, setProfile, EMPLOYEE_NAME, type Profile } from "@/lib/demoProfile";
import { EmployeeNotification } from "@/components/demo/EmployeeNotification";
import { EmployeeCommissions } from "@/components/demo/EmployeeCommissions";
import { TeamPerformance } from "@/components/demo/TeamPerformance";
import { TeamPage } from "@/components/demo/TeamPage";
import { EmployeeNewClientModal } from "@/components/demo/EmployeeNewClientModal";
import { ClientProfileModal } from "@/components/demo/ClientProfileModal";
import { BarChart3, Home, UserPlus, Users2 } from "lucide-react";
import { Crown } from "lucide-react";
import {
  appointmentsStore,
  servicesStore,
  deleteService,
  CATEGORY_COLORS,
  type Service,
  type AppointmentStatus,
} from "@/lib/demoStore";
import { toast } from "sonner";

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
  { targetId: "tour-dashboard", title: "Dashboard", description: "Veja tudo do seu salão em tempo real 📊" },
  { targetId: "tour-appointments", title: "Agendamentos", description: "Todos os horários organizados automaticamente 📅" },
  { targetId: "tour-clients", title: "Clientes", description: "Histórico completo de cada cliente 👥" },
  { targetId: "tour-bot", title: "Bot WhatsApp", description: "Seu bot atendendo enquanto você trabalha 🤖" },
  { targetId: "tour-cta", title: "Pronto?", description: "Pronto para transformar seu salão? 💅" },
];

type Tab = "dashboard" | "appointments" | "clients" | "services" | "bot" | "reports" | "settings" | "commissions" | "performance" | "team";

const TOUR_KEY = "demo_tour_seen_v2";

function DemoPage() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [tourActive, setTourActive] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const settings = useSettings();
  const profile = useProfile();
  const isEmployee = profile === "employee";
  const [empNewClientOpen, setEmpNewClientOpen] = useState(false);

  // Reset tab if current tab isn't allowed for this profile
  useEffect(() => {
    if (isEmployee && !["dashboard", "appointments", "clients", "commissions"].includes(tab)) {
      setTab("dashboard");
    }
  }, [isEmployee, tab]);

  const goHome = () => {
    setStarted(false);
    setTourActive(false);
    setTab("dashboard");
    if (typeof window !== "undefined") localStorage.removeItem(TOUR_KEY);
  };

  const startDemo = () => {
    setStarted(true);
    const seen = typeof window !== "undefined" && localStorage.getItem(TOUR_KEY);
    if (!seen) {
      setTimeout(() => setTourActive(true), 500);
      if (typeof window !== "undefined") localStorage.setItem(TOUR_KEY, "1");
    }
  };

  if (!started) return <Landing onStart={startDemo} salonName={settings.salonName} />;

  const mobileTabs: Tab[] = isEmployee
    ? ["dashboard", "appointments", "clients", "commissions"]
    : ["dashboard", "appointments", "clients", "services", "bot", "team", "performance", "reports", "settings"];


  return (
    <div className="min-h-screen bg-background">
      <DemoBadge />

      <div className="flex min-h-screen">
        <aside
          className="w-60 border-r border-border hidden md:flex flex-col transition-colors duration-300"
          style={
            isEmployee
              ? { background: "linear-gradient(180deg, oklch(0.98 0.015 25), var(--card))" }
              : { background: "var(--card)" }
          }
        >
          <div className="p-5 border-b border-border flex items-center gap-2">
            <Logo />
            <span className="font-bold truncate flex-1">{isEmployee ? EMPLOYEE_NAME : settings.salonName}</span>
          </div>
          <div className="px-3 pt-3">
            <button
              onClick={goHome}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
              style={{
                background: "transparent",
                border: "1.5px solid var(--rose-gold)",
                color: "var(--rose-gold-dark)",
              }}
            >
              <Home className="w-3.5 h-3.5" /> ← Voltar ao início
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {isEmployee ? (
              <>
                <NavItem active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />}>Início</NavItem>
                <NavItem active={tab === "appointments"} onClick={() => setTab("appointments")} icon={<Calendar className="w-4 h-4" />}>Minha Agenda</NavItem>
                <NavItem active={tab === "clients"} onClick={() => setTab("clients")} icon={<Users className="w-4 h-4" />}>Meus Clientes</NavItem>
                <NavItem active={tab === "commissions"} onClick={() => setTab("commissions")} icon={<DollarSign className="w-4 h-4" />}>Minhas Comissões</NavItem>
                <button
                  onClick={() => setEmpNewClientOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02] mt-2"
                  style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
                >
                  <UserPlus className="w-4 h-4" /> ➕ Nova Cliente
                </button>
              </>
            ) : (
              <>
                <NavItem id="tour-dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="w-4 h-4" />}>Dashboard</NavItem>
                <NavItem id="tour-appointments" active={tab === "appointments"} onClick={() => setTab("appointments")} icon={<Calendar className="w-4 h-4" />}>Agendamentos</NavItem>
                <NavItem id="tour-clients" active={tab === "clients"} onClick={() => setTab("clients")} icon={<Users className="w-4 h-4" />}>Clientes</NavItem>
                <NavItem active={tab === "services"} onClick={() => setTab("services")} icon={<Scissors className="w-4 h-4" />}>Serviços</NavItem>
                <NavItem id="tour-bot" active={tab === "bot"} onClick={() => setTab("bot")} icon={<MessageCircle className="w-4 h-4" />}>Bot WhatsApp</NavItem>
                <NavItem active={tab === "team"} onClick={() => setTab("team")} icon={<Users2 className="w-4 h-4" />}>Equipe</NavItem>
                <NavItem active={tab === "performance"} onClick={() => setTab("performance")} icon={<BarChart3 className="w-4 h-4" />}>📊 Desempenho</NavItem>
                <NavItem active={tab === "reports"} onClick={() => setTab("reports")} icon={<TrendingUp className="w-4 h-4" />}>Relatórios</NavItem>
                <NavItem active={tab === "settings"} onClick={() => setTab("settings")} icon={<SettingsIcon className="w-4 h-4" />}>Configurações</NavItem>
              </>
            )}
          </nav>
          <div className="p-3 border-t border-border">
            <button
              id="tour-cta"
              onClick={() => setExitOpen(true)}
              className="w-full px-3 py-2.5 rounded-lg text-white font-medium text-sm transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
            >
              Quero este sistema!
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <button
              onClick={goHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "transparent",
                border: "1.5px solid var(--rose-gold)",
                color: "var(--rose-gold-dark)",
              }}
            >
              <Home className="w-3.5 h-3.5" /> ← Início
            </button>
          </div>
          <div className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-2">
            {mobileTabs.map((t) => (
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

          {tab === "dashboard" && (isEmployee ? <EmployeeDashboard /> : <Dashboard ownerName={settings.ownerName} />)}
          {tab === "appointments" && <Appointments isEmployee={isEmployee} />}
          {tab === "clients" && <Clients />}
          {tab === "services" && !isEmployee && <Services />}
          {tab === "bot" && !isEmployee && <BotPage />}
          {tab === "reports" && !isEmployee && <Reports />}
          {tab === "settings" && !isEmployee && <SettingsPage />}
          {tab === "team" && !isEmployee && <TeamPage />}
          {tab === "performance" && !isEmployee && <TeamPerformance />}
          {tab === "commissions" && isEmployee && <EmployeeCommissions />}

          {isEmployee && (
            <button
              onClick={() => setEmpNewClientOpen(true)}
              className="md:hidden fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold shadow-lg"
              style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
              aria-label="Nova Cliente"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}

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

      {tourActive && !isEmployee && <DemoTour steps={TOUR_STEPS} onFinish={() => setTourActive(false)} />}
      {exitOpen && <ExitDemoModal onClose={() => setExitOpen(false)} />}
      {empNewClientOpen && <EmployeeNewClientModal onClose={() => setEmpNewClientOpen(false)} />}
    </div>
  );
}

function Logo() {
  const s = useSettings();
  if (s.logoDataUrl) {
    return <img src={s.logoDataUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />;
  }
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-rose-gold)" }}>
      <Sparkles className="w-4 h-4 text-white" />
    </div>
  );
}

function NavItem({
  id, active, onClick, icon, children,
}: { id?: string; active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "text-white" : "text-foreground hover:bg-accent"}`}
      style={active ? { background: "var(--gradient-rose-gold)" } : undefined}
    >
      {icon}
      {children}
    </button>
  );
}

function HighlightCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border flex gap-3 items-start">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: "var(--gradient-rose-gold)" }}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Landing({ onStart, salonName }: { onStart: () => void; salonName: string }) {
  const [planLead, setPlanLead] = useState<string | null>(null);
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-rose-soft)" }}>
      <div className="px-4 py-10">
        <div className="max-w-5xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: "white", color: "var(--rose-gold-dark)", boxShadow: "var(--shadow-rose)" }}>
            <Sparkles className="w-3 h-3" /> Demonstração interativa gratuita
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

          <ProfileSelector />

          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-transform hover:scale-105"
            style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-elegant)" }}
          >
            <Play className="w-5 h-5" /> Iniciar Demonstração Gratuita <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4 mb-12">Sem cadastro • Sem cartão de crédito</p>

          {/* Mari section */}
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Veja a IA em ação</h2>
            <p className="text-muted-foreground mb-8">Conheça a Mari, sua atendente virtual humanizada — disponível 24h.</p>
            <div className="grid lg:grid-cols-2 gap-8 items-center text-left">
              <MariSimulation />
              <div className="space-y-3">
                <HighlightCard icon={<Brain />} title="Entende erros de português" desc="Compreende digitação errada, gírias e abreviações como uma pessoa real." />
                <HighlightCard icon={<MessageSquareHeart />} title="Fala como uma atendente real" desc="Tom caloroso, emojis e empatia em cada resposta. Seus clientes amam." />
                <HighlightCard icon={<Zap />} title="Responde em menos de 2 segundos" desc="Atendimento instantâneo, mesmo de madrugada. Nunca perde um agendamento." />
                <div className="rounded-xl p-5 text-white mt-4" style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}>
                  <div className="text-3xl font-bold">+38%</div>
                  <div className="text-sm opacity-95">de agendamentos no primeiro mês para {salonName}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PricingSection onChoose={(p) => setPlanLead(p)} />

      {planLead && <ExitDemoModal plan={planLead} onClose={() => setPlanLead(null)} />}
    </div>
  );
}

function PricingSection({ onChoose }: { onChoose: (plan: string) => void }) {
  return (
    <section className="relative px-4 py-20 mt-16" style={{ background: "#0A0A0A" }}>
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--gradient-rose-gold)", opacity: 0.7 }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 -translate-y-1/2 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-rose-gold)" }} />

      <div className="max-w-6xl mx-auto text-center relative">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Escolha como você quer ter o sistema
        </h2>
        <p className="text-base md:text-lg text-white/60 mb-12">Sem letra miúda. Sem surpresa.</p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-6 items-stretch text-left">
          {/* CARD 1 — Starter / Owner */}
          <PricingCard
            icon="🏆"
            badge="STARTER"
            title="Quero ser dono"
            price="R$ 2.500"
            priceSubtitle="pagamento único, sem mensalidade"
            benefits={[
              "Sistema instalado no seu servidor",
              "Seu nome e logo no sistema",
              "Bot WhatsApp com IA humanizada",
              "Você é dono para sempre",
              "Suporte por 60 dias incluído",
              "Nunca paga mensalidade",
            ]}
            ctaLabel="Quero ser dono →"
            ctaVariant="dark"
            onClick={() => onChoose("Starter — R$ 2.500 único")}
          />

          {/* CARD 2 — Mensal (highlighted) */}
          <PricingCard
            icon="💅"
            badge="MAIS ESCOLHIDO"
            title="Quero pagar por mês"
            price="R$ 129"
            priceSuffix="/mês"
            priceSubtitle="sem taxa de instalação"
            benefits={[
              "Sistema pronto em 24 horas",
              "Seu nome e logo no sistema",
              "Bot WhatsApp com IA humanizada",
              "Atualizações automáticas incluídas",
              "Suporte prioritário sempre",
              "Cancela quando quiser",
            ]}
            ctaLabel="Começar agora →"
            ctaVariant="solid"
            highlighted
            onClick={() => onChoose("Mensal — R$ 129/mês")}
          />

          {/* CARD 3 — Anual */}
          <PricingCard
            icon="💎"
            badge="MELHOR CUSTO BENEFÍCIO"
            title="Quero pagar anual"
            price="R$ 119"
            priceSuffix="/mês"
            priceSubtitle="R$ 1.428 à vista (12x R$119) • ECONOMIA DE R$120/ANO vs plano mensal"
            benefits={[
              "Sistema pronto em 24 horas",
              "Seu nome e logo no sistema",
              "Bot WhatsApp com IA humanizada",
              "Atualizações automáticas incluídas",
              "Suporte prioritário sempre",
              "✅ IA humanizada incluída",
              "✅ Prioridade em novos recursos",
              "🎁 Suporte VIP com WhatsApp direto",
            ]}
            ctaLabel="Quero economizar →"
            ctaVariant="dark"
            onClick={() => onChoose("Anual — R$ 1.428 (R$ 119/mês)")}
          />
        </div>

        <p className="text-sm md:text-base mt-10 font-medium" style={{ color: "var(--rose-gold-light)" }}>
          💛 Economia de até R$1.800/ano comparado a uma recepcionista
        </p>
      </div>
    </section>
  );
}

function PricingCard({
  icon, badge, title, price, priceSuffix, priceSubtitle, benefits, ctaLabel, ctaVariant, highlighted, onClick,
}: {
  icon: string;
  badge: string;
  title: string;
  price: string;
  priceSuffix?: string;
  priceSubtitle: string;
  benefits: string[];
  ctaLabel: string;
  ctaVariant: "solid" | "dark";
  highlighted?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 md:p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${highlighted ? "md:scale-[1.04]" : ""}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: highlighted ? "1.5px solid var(--rose-gold)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: highlighted
          ? "0 0 40px -10px var(--rose-gold), 0 20px 60px -20px rgba(0,0,0,0.6)"
          : "0 20px 50px -25px rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider"
        style={
          highlighted
            ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
            : { background: "rgba(255,255,255,0.1)", color: "var(--rose-gold-light)", border: "1px solid rgba(255,255,255,0.15)" }
        }
      >
        {badge}
      </div>

      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold" style={{ background: "var(--gradient-rose-gold)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {price}
          </span>
          {priceSuffix && <span className="text-xl text-white/70 font-semibold">{priceSuffix}</span>}
        </div>
        <p className="text-xs text-white/50 mt-1">{priceSubtitle}</p>
      </div>

      <ul className="space-y-2.5 mb-7">
        {benefits.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-white/85">
            <span className="text-base leading-5" style={{ color: "var(--rose-gold-light)" }}>✅</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-transform hover:scale-[1.02]"
        style={
          ctaVariant === "solid"
            ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
            : { background: "#141414", color: "white", border: "1.5px solid var(--rose-gold)" }
        }
      >
        {ctaLabel}
      </button>
    </div>
  );
}


function Dashboard({ ownerName }: { ownerName: string }) {
  const appts = appointmentsStore.use();
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayAppts = appts.filter((a) => a.date === todayKey);

  return (
    <div className="space-y-6 animate-fade-in">
      <div
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
        style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
      >
        <Crown className="w-4 h-4" />
        <span>👑 Visão da Dona — você vê tudo do salão</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {ownerName}! 👋</h1>
        <p className="text-muted-foreground text-sm">Aqui está o resumo do seu salão hoje.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Calendar />} label="Agendamentos hoje" value={String(todayAppts.length || DEMO_STATS.todayAppointments)} accent />
        <StatCard icon={<Users />} label="Clientes ativos" value={String(DEMO_STATS.activeClients)} />
        <StatCard icon={<DollarSign />} label="Faturamento do mês" value={`R$ ${DEMO_STATS.monthlyRevenue.toLocaleString("pt-BR")}`} />
        <StatCard icon={<TrendingUp />} label="Taxa de retorno" value={`${DEMO_STATS.returnRate}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border">
          <h2 className="font-semibold text-foreground mb-3">Próximos agendamentos</h2>
          <div className="space-y-2">
            {appts.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: "var(--gradient-rose-gold)" }}>
                  {a.clientName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{a.clientName}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.service}</div>
                </div>
                <StatusBadge status={a.status} />
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
            <span className="text-sm text-foreground">Mari está online</span>
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

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map = {
    confirmado: { label: "Confirmado", bg: "oklch(0.92 0.10 145)", fg: "oklch(0.35 0.15 145)" },
    pendente: { label: "Pendente", bg: "oklch(0.95 0.10 90)", fg: "oklch(0.45 0.15 70)" },
    cancelado: { label: "Cancelado", bg: "oklch(0.93 0.06 25)", fg: "oklch(0.45 0.20 25)" },
  } as const;
  const s = map[status];
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.fg }}>{s.label}</span>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium text-foreground">{value}</span></div>;
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-4 border border-border" style={accent ? { background: "var(--gradient-rose-gold)", color: "white", border: "none" } : { background: "var(--card)" }}>
      <div className={accent ? "opacity-90" : "text-muted-foreground"}><div className="w-8 h-8">{icon}</div></div>
      <div className={`text-2xl font-bold mt-2 ${accent ? "" : "text-foreground"}`}>{value}</div>
      <div className={`text-xs ${accent ? "opacity-90" : "text-muted-foreground"}`}>{label}</div>
    </div>
  );
}

function Appointments({ isEmployee = false }: { isEmployee?: boolean }) {
  const all = appointmentsStore.use();
  // Pretend employee Carla owns roughly half the schedule
  const appts = isEmployee ? all.filter((_, i) => i % 2 === 0) : all;
  const [open, setOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (confetti) {
      const t = setTimeout(() => setConfetti(false), 2200);
      return () => clearTimeout(t);
    }
  }, [confetti]);

  const handleNew = () => setOpen(true);

  return (
    <div className="space-y-4 animate-fade-in">
      {confetti && <Confetti duration={2000} />}
      {isEmployee && (
        <div
          className="rounded-lg px-4 py-2.5 text-sm font-medium border"
          style={{
            background: "oklch(0.97 0.025 25)",
            borderColor: "var(--rose-gold)",
            color: "var(--rose-gold-dark)",
          }}
        >
          💅 Visão da Funcionária — você vê apenas sua agenda
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">{isEmployee ? "Minha Agenda" : "Agendamentos"}</h1>
        {!isEmployee && (
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-105"
            style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        )}
      </div>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--accent)" }}>
            <tr className="text-left">
              <Th>Cliente</Th><Th>Serviço</Th><Th>Profissional</Th><Th>Data</Th><Th>Horário</Th><Th>Status</Th><Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {appts.map((a) => {
              const prof = professionalForAppointment(a.id, a.service);
              return (
                <tr key={a.id} className="border-t border-border">
                  <Td>{a.clientName}</Td>
                  <Td>{a.service}</Td>
                  <Td><ProfessionalChip name={prof} /></Td>
                  <Td>{new Date(a.date + "T00:00:00").toLocaleDateString("pt-BR")}</Td>
                  <Td>{a.time}</Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td className="font-medium">R$ {a.price}</Td>
                </tr>
              );
            })}
            {appts.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">Nenhum agendamento ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {open && <NewAppointmentModal onClose={() => { setOpen(false); setConfetti(true); }} />}
    </div>
  );
}

function EmployeeDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {EMPLOYEE_NAME}! 💅</h1>
        <p className="text-muted-foreground text-sm">Aqui está sua agenda de hoje</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Calendar />} label="Seus agendamentos hoje" value="4" accent />
        <StatCard icon={<DollarSign />} label="Seu faturamento hoje" value="R$ 320" />
        <StatCard icon={<Clock />} label="Sua próxima cliente" value="Ana Silva 14h" />
      </div>

      <EmployeeNotification />

      <div className="bg-card rounded-xl p-5 border border-border">
        <h2 className="font-semibold text-foreground mb-3">Sua agenda de hoje</h2>
        <div className="space-y-2">
          {[
            { name: "Ana Silva", service: "Corte Feminino", time: "14:00" },
            { name: "Camila Oliveira", service: "Manicure", time: "15:00" },
            { name: "Beatriz Souza", service: "Hidratação", time: "16:30" },
            { name: "Patricia Rocha", service: "Sobrancelha Design", time: "18:00" },
          ].map((a) => (
            <div key={a.time} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: "var(--gradient-rose-gold)" }}>
                {a.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground truncate">{a.service}</div>
              </div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {a.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileSelector() {
  const profile = useProfile();
  const Btn = ({ value, icon, label }: { value: Profile; icon: string; label: string }) => {
    const active = profile === value;
    return (
      <button
        onClick={() => setProfile(value)}
        className="px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2"
        style={
          active
            ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
            : { background: "white", color: "var(--foreground)", border: "1px solid var(--border)" }
        }
      >
        <span>{icon}</span> {label}
      </button>
    );
  };

  return (
    <div className="mb-6 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-3">Quero ver o sistema como:</p>
      <div className="inline-flex flex-wrap gap-2 justify-center p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)" }}>
        <Btn value="owner" icon="👑" label="Dona do Salão" />
        <Btn value="employee" icon="💅" label="Funcionária" />
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        A dona vê tudo. A funcionária vê apenas a própria agenda e comissões.
      </p>
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
  const [openClient, setOpenClient] = useState<string | null>(null);
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
      <p className="text-sm text-muted-foreground">Clique em uma cliente para ver o histórico inteligente.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DEMO_CLIENTS.map((c) => (
          <button
            key={c.id}
            onClick={() => setOpenClient(c.name)}
            className="bg-card rounded-xl p-4 border border-border flex gap-3 items-center text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
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
          </button>
        ))}
      </div>
      {openClient && <ClientProfileModal clientName={openClient} onClose={() => setOpenClient(null)} />}
    </div>
  );
}

function Services() {
  const services = servicesStore.use();
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = (s: Service) => {
    if (confirm(`Excluir "${s.name}"?`)) {
      deleteService(s.id);
      toast.success("Serviço removido");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-transform hover:scale-105"
          style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
        >
          <Plus className="w-4 h-4" /> Adicionar Serviço
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="group relative bg-card rounded-xl p-5 border border-border hover:shadow-lg transition-shadow">
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2" style={{ background: CATEGORY_COLORS[s.category], color: "oklch(0.25 0.10 30)" }}>
              {s.category}
            </span>
            <h3 className="font-semibold text-foreground">{s.name}</h3>
            {s.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration} min</span>
              <span className="font-bold" style={{ color: "var(--rose-gold-dark)" }}>R$ {s.price}</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(s)} className="p-1.5 rounded-md bg-background border border-border hover:bg-accent" aria-label="Editar">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(s)} className="p-1.5 rounded-md bg-background border border-border hover:bg-destructive hover:text-destructive-foreground" aria-label="Excluir">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {creating && <ServiceFormModal onClose={() => setCreating(false)} />}
      {editing && <ServiceFormModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BotPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bot WhatsApp — Mari 💅</h1>
        <p className="text-muted-foreground text-sm">Veja sua atendente virtual em ação.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <MariSimulation />
        <div className="space-y-3">
          <div className="bg-card rounded-xl p-5 border border-border">
            <h3 className="font-semibold text-foreground mb-2">✨ O que a Mari faz</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Atende clientes 24h, todos os dias</li>
              <li>✅ Agenda automaticamente nos horários livres</li>
              <li>✅ Entende erros de digitação e gírias</li>
              <li>✅ Envia lembretes antes do horário</li>
              <li>✅ Confirma e remarca compromissos</li>
              <li>✅ Mostra serviços e preços</li>
            </ul>
          </div>
          <div className="rounded-xl p-5 text-white" style={{ background: "var(--gradient-rose-gold)" }}>
            <div className="text-3xl font-bold">+38%</div>
            <div className="text-sm opacity-90">de agendamentos no primeiro mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const appts = appointmentsStore.use();
  const services = servicesStore.use();
  const totalRevenue = appts.reduce((s, a) => s + a.price, 0);
  const byService = useMemo(() => services.map((s) => {
    const count = appts.filter((a) => a.service === s.name).length;
    return { ...s, count, total: count * s.price };
  }).sort((a, b) => b.total - a.total), [appts, services]);
  const max = Math.max(...byService.map((s) => s.total), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={<DollarSign />} label="Faturamento" value={`R$ ${totalRevenue.toLocaleString("pt-BR")}`} accent />
        <StatCard icon={<Calendar />} label="Total agendamentos" value={String(appts.length)} />
        <StatCard icon={<TrendingUp />} label="Ticket médio" value={`R$ ${appts.length ? Math.round(totalRevenue / appts.length) : 0}`} />
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
