import { useEffect, useState } from "react";
import { Trophy, Star, AlertCircle, TrendingUp, Calendar, Clock } from "lucide-react";
import { Confetti } from "./Confetti";

type Period = "semana" | "mes" | "ano";

type Employee = {
  id: string;
  name: string;
  initial: string;
  color: string;
  active: boolean;
  appointments: number;
  revenue: number;
  goal: number;
  topServices: { name: string; count: number }[];
  returnRate: number;
  bestDay: string;
  busiestHour: string;
  rating: number;
};

const EMPLOYEES: Employee[] = [
  {
    id: "carla",
    name: "Carla Silva",
    initial: "C",
    color: "oklch(0.75 0.12 25)",
    active: true,
    appointments: 32,
    revenue: 2840,
    goal: 3000,
    topServices: [
      { name: "Coloração", count: 12 },
      { name: "Corte", count: 8 },
      { name: "Escova", count: 6 },
    ],
    returnRate: 78,
    bestDay: "Sexta-feira",
    busiestHour: "14h — 17h",
    rating: 4.9,
  },
  {
    id: "juliana",
    name: "Juliana Costa",
    initial: "J",
    color: "oklch(0.75 0.12 350)",
    active: true,
    appointments: 28,
    revenue: 2100,
    goal: 2500,
    topServices: [
      { name: "Hidratação", count: 10 },
      { name: "Corte", count: 9 },
      { name: "Manicure", count: 5 },
    ],
    returnRate: 71,
    bestDay: "Quinta-feira",
    busiestHour: "10h — 13h",
    rating: 4.8,
  },
  {
    id: "patricia",
    name: "Patricia Lima",
    initial: "P",
    color: "oklch(0.75 0.12 280)",
    active: true,
    appointments: 21,
    revenue: 1680,
    goal: 2000,
    topServices: [
      { name: "Manicure", count: 9 },
      { name: "Pedicure", count: 7 },
      { name: "Sobrancelha", count: 4 },
    ],
    returnRate: 65,
    bestDay: "Sábado",
    busiestHour: "13h — 16h",
    rating: 4.7,
  },
  {
    id: "renata",
    name: "Renata Ferreira",
    initial: "R",
    color: "oklch(0.75 0.10 200)",
    active: true,
    appointments: 17,
    revenue: 1320,
    goal: 2000,
    topServices: [
      { name: "Corte", count: 7 },
      { name: "Escova", count: 5 },
      { name: "Hidratação", count: 3 },
    ],
    returnRate: 58,
    bestDay: "Quarta-feira",
    busiestHour: "15h — 18h",
    rating: 4.5,
  },
  {
    id: "gabriela",
    name: "Gabriela Alves",
    initial: "G",
    color: "oklch(0.75 0.10 140)",
    active: true,
    appointments: 12,
    revenue: 980,
    goal: 1800,
    topServices: [
      { name: "Sobrancelha", count: 6 },
      { name: "Manicure", count: 4 },
      { name: "Pedicure", count: 2 },
    ],
    returnRate: 49,
    bestDay: "Terça-feira",
    busiestHour: "11h — 14h",
    rating: 4.4,
  },
];

const PAID: Record<string, boolean> = { renata: true };

export function TeamPerformance() {
  const [period, setPeriod] = useState<Period>("mes");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...EMPLOYEES].sort((a, b) => b.revenue - a.revenue);
  const top3 = sorted.slice(0, 3);
  const maxRevenue = Math.max(...EMPLOYEES.map((e) => e.revenue));

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Desempenho da Equipe</h1>
          <p className="text-muted-foreground text-sm">Acompanhe o rendimento de cada profissional</p>
        </div>
        <div className="flex gap-2">
          {(["semana", "mes", "ano"] as Period[]).map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                style={
                  active
                    ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
                    : { background: "var(--secondary)", color: "var(--foreground)" }
                }
              >
                {p === "semana" ? "Esta semana" : p === "mes" ? "Este mês" : "Este ano"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium */}
      <div className="rounded-2xl p-6 border border-border bg-card relative overflow-hidden">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-5 h-5" style={{ color: "var(--rose-gold-dark)" }} />
          <h2 className="font-semibold text-foreground">Ranking do mês</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* 2nd */}
          <PodiumCard place={2} emp={top3[1]} height="h-32" medal="🥈" />
          {/* 1st */}
          <div className="relative">
            <PodiumCard place={1} emp={top3[0]} height="h-44" medal="🥇" highlight />
            <Confetti duration={3500} />
          </div>
          {/* 3rd */}
          <PodiumCard place={3} emp={top3[2]} height="h-24" medal="🥉" />
        </div>
      </div>

      {/* Individual cards */}
      <div className="grid lg:grid-cols-2 gap-5">
        {EMPLOYEES.map((e) => (
          <EmployeeCard key={e.id} emp={e} />
        ))}
      </div>

      {/* Comparison chart */}
      <div className="rounded-2xl p-6 border border-border bg-card">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5" style={{ color: "var(--rose-gold-dark)" }} />
          <h2 className="font-semibold text-foreground">Comparação de faturamento</h2>
        </div>
        <div className="space-y-3">
          {sorted.map((e) => {
            const pct = (e.revenue / maxRevenue) * 100;
            return (
              <div key={e.id} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium text-foreground shrink-0">{e.name.split(" ")[0]}</div>
                <div className="flex-1 h-7 rounded-md bg-secondary overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: animate ? `${pct}%` : "0%",
                      background: "var(--gradient-rose-gold)",
                    }}
                  />
                </div>
                <div className="w-20 text-sm font-semibold text-foreground text-right shrink-0">R$ {e.revenue.toLocaleString("pt-BR")}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" style={{ color: "var(--rose-gold-dark)" }} />
          Atenção
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          <AlertCard tone="red" text="Gabriela está 45% abaixo da meta este mês" />
          <AlertCard tone="yellow" text="Renata não bate meta há 2 meses seguidos" />
          <AlertCard tone="green" text="Carla bateu a meta com 3 dias de antecedência! 🎉" />
        </div>
      </div>

      {/* Commissions */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Comissões a pagar este mês</h2>
          <p className="text-xs text-muted-foreground mt-0.5">30% sobre o faturamento</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--accent)" }}>
              <tr className="text-left">
                <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide">Funcionária</th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide text-right">Faturou</th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide text-right">Comissão (30%)</th>
                <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((e) => {
                const commission = Math.round(e.revenue * 0.3);
                const paid = PAID[e.id];
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-foreground">{e.name}</td>
                    <td className="px-4 py-2.5 text-foreground text-right">R$ {e.revenue.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-2.5 text-right font-medium" style={{ color: "var(--rose-gold-dark)" }}>
                      R$ {commission.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {paid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                          ✅ Pago
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                          🟡 Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  place,
  emp,
  height,
  medal,
  highlight,
}: {
  place: number;
  emp: Employee;
  height: string;
  medal: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 text-center border ${highlight ? "border-transparent" : "border-border"} flex flex-col justify-end ${height}`}
      style={
        highlight
          ? { background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }
          : { background: "var(--accent)" }
      }
    >
      <div className="text-3xl mb-1">{medal}</div>
      <div className={`font-bold ${highlight ? "text-white" : "text-foreground"}`}>{emp.name}</div>
      <div className={`text-sm mt-1 ${highlight ? "text-white/90" : "text-muted-foreground"}`}>
        R$ {emp.revenue.toLocaleString("pt-BR")} no mês
      </div>
      <div className={`text-xs ${highlight ? "text-white/80" : "text-muted-foreground"}`}>
        {emp.appointments} atendimentos
      </div>
    </div>
  );
}

function EmployeeCard({ emp }: { emp: Employee }) {
  const pct = Math.min((emp.revenue / emp.goal) * 100, 100);
  const ticket = Math.round(emp.revenue / emp.appointments);
  return (
    <div className="rounded-xl p-5 border border-border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: emp.color }}
          >
            {emp.initial}
          </div>
          <div className="font-semibold text-foreground">{emp.name}</div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
          🟢 Ativa
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <Metric label="Atendimentos" value={emp.appointments.toString()} />
        <Metric label="Faturamento" value={`R$ ${emp.revenue.toLocaleString("pt-BR")}`} />
        <Metric label="Ticket" value={`R$ ${ticket}`} />
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Meta do mês: R$ {emp.goal.toLocaleString("pt-BR")}</span>
          <span className="font-medium text-foreground">{Math.round(pct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "var(--gradient-rose-gold)" }}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Serviços mais realizados</div>
          <div className="flex flex-wrap gap-1.5">
            {emp.topServices.map((s) => (
              <span key={s.name} className="px-2 py-0.5 rounded-full text-xs bg-accent text-foreground">
                {s.name} ({s.count}x)
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Taxa de retorno</span>
          <span className="font-medium text-foreground">{emp.returnRate}%</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Melhor dia</span>
          <span className="font-medium text-foreground">{emp.bestDay}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Horário de pico</span>
          <span className="font-medium text-foreground">{emp.busiestHour}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Avaliação média</span>
          <span className="font-medium text-foreground flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {emp.rating}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors text-foreground">
          Ver agenda completa
        </button>
        <button className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors text-foreground">
          Ver histórico
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-accent rounded-lg p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-bold text-foreground text-sm mt-0.5">{value}</div>
    </div>
  );
}

function AlertCard({ tone, text }: { tone: "red" | "yellow" | "green"; text: string }) {
  const styles = {
    red: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/40 dark:border-yellow-900 dark:text-yellow-200",
    green: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-900 dark:text-green-200",
  }[tone];
  const icon = tone === "red" ? "🔴" : tone === "yellow" ? "🟡" : "🟢";
  return (
    <div className={`rounded-lg p-4 border text-sm ${styles}`}>
      <span className="mr-1">{icon}</span>
      {text}
    </div>
  );
}
