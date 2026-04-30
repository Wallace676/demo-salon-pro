import { DollarSign, Scissors, Target } from "lucide-react";

const SERVICES_DONE = [
  { id: 1, client: "Ana Silva", service: "Corte Feminino", price: 80 },
  { id: 2, client: "Juliana Costa", service: "Coloração", price: 180 },
  { id: 3, client: "Fernanda Lima", service: "Hidratação", price: 120 },
  { id: 4, client: "Beatriz Souza", service: "Escova Progressiva", price: 220 },
  { id: 5, client: "Camila Oliveira", service: "Corte Feminino", price: 80 },
  { id: 6, client: "Patricia Rocha", service: "Manicure", price: 45 },
  { id: 7, client: "Larissa Mendes", service: "Coloração", price: 180 },
  { id: 8, client: "Gabriela Alves", service: "Sobrancelha Design", price: 35 },
  { id: 9, client: "Renata Ferreira", service: "Hidratação", price: 120 },
  { id: 10, client: "Mariana Santos", service: "Corte Feminino", price: 80 },
  { id: 11, client: "Ana Silva", service: "Manicure", price: 45 },
  { id: 12, client: "Camila Oliveira", service: "Escova", price: 90 },
  { id: 13, client: "Beatriz Souza", service: "Coloração", price: 180 },
  { id: 14, client: "Fernanda Lima", service: "Sobrancelha Design", price: 35 },
  { id: 15, client: "Patricia Rocha", service: "Corte Feminino", price: 80 },
  { id: 16, client: "Juliana Costa", service: "Hidratação", price: 120 },
  { id: 17, client: "Larissa Mendes", service: "Manicure", price: 45 },
  { id: 18, client: "Gabriela Alves", service: "Pedicure", price: 55 },
];

const RATE = 0.3;
const GOAL = 800;

export function EmployeeCommissions() {
  const totalRevenue = SERVICES_DONE.reduce((s, x) => s + x.price, 0);
  const commission = Math.round(totalRevenue * RATE);
  const remaining = Math.max(GOAL - commission, 0);
  const pct = Math.min((commission / GOAL) * 100, 100);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Comissões</h1>
        <p className="text-muted-foreground text-sm">Acompanhe seus ganhos do mês.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5 text-white"
          style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
        >
          <DollarSign className="w-7 h-7 opacity-90" />
          <div className="text-3xl font-bold mt-2">R$ {commission}</div>
          <div className="text-sm opacity-90">Comissão do mês ({Math.round(RATE * 100)}%)</div>
        </div>
        <div className="rounded-xl p-5 border border-border bg-card">
          <Scissors className="w-7 h-7 text-muted-foreground" />
          <div className="text-3xl font-bold mt-2 text-foreground">{SERVICES_DONE.length}</div>
          <div className="text-sm text-muted-foreground">Serviços realizados</div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5" style={{ color: "var(--rose-gold-dark)" }} />
          <h2 className="font-semibold text-foreground">Meta do mês</h2>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">R$ {commission} de R$ {GOAL}</span>
          <span className="font-medium text-foreground">
            {remaining > 0 ? `Faltam R$ ${remaining}` : "Meta atingida! 🎉"}
          </span>
        </div>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "var(--gradient-rose-gold)" }}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ background: "var(--accent)" }}>
            <tr className="text-left">
              <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide">Cliente</th>
              <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide">Serviço</th>
              <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide text-right">Valor</th>
              <th className="px-4 py-2.5 font-semibold text-foreground text-xs uppercase tracking-wide text-right">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES_DONE.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2.5 text-foreground">{s.client}</td>
                <td className="px-4 py-2.5 text-foreground">{s.service}</td>
                <td className="px-4 py-2.5 text-foreground text-right">R$ {s.price}</td>
                <td className="px-4 py-2.5 text-right font-medium" style={{ color: "var(--rose-gold-dark)" }}>
                  R$ {Math.round(s.price * RATE)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-accent/50">
              <td className="px-4 py-2.5 font-bold text-foreground" colSpan={2}>Total</td>
              <td className="px-4 py-2.5 text-right font-bold text-foreground">R$ {totalRevenue}</td>
              <td className="px-4 py-2.5 text-right font-bold" style={{ color: "var(--rose-gold-dark)" }}>R$ {commission}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
