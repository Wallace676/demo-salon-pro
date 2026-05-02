import { AlertTriangle } from "lucide-react";
import { servicesStore } from "@/lib/demoStore";
import { useEmployeeSpecialties, toggleSpecialty } from "@/lib/employeeSpecialties";

const TEAM = [
  { id: "carla", name: "Carla Silva", color: "oklch(0.75 0.12 25)" },
  { id: "juliana", name: "Juliana Costa", color: "oklch(0.75 0.12 350)" },
  { id: "patricia", name: "Patricia Lima", color: "oklch(0.75 0.12 280)" },
  { id: "renata", name: "Renata Ferreira", color: "oklch(0.75 0.10 200)" },
  { id: "gabriela", name: "Gabriela Alves", color: "oklch(0.75 0.10 140)" },
];

export function TeamPage() {
  const services = servicesStore.use();
  const specs = useEmployeeSpecialties();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
        <p className="text-muted-foreground text-sm">
          Configure o que cada profissional faz. O bot só agendará serviços autorizados.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {TEAM.map((emp) => {
          const allowed = specs[emp.id] || [];
          const empty = allowed.length === 0;
          return (
            <div key={emp.id} className="rounded-xl p-5 border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: emp.color }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{emp.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {allowed.length} serviço{allowed.length === 1 ? "" : "s"} autorizado
                    {allowed.length === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="text-sm font-semibold text-foreground mb-1">
                ✂️ O que esta profissional faz
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                O bot só agendará serviços autorizados para esta profissional
              </p>

              {empty && (
                <div className="rounded-lg p-3 mb-3 border text-xs flex items-start gap-2"
                     style={{ background: "oklch(0.96 0.05 60)", borderColor: "oklch(0.85 0.10 60)", color: "oklch(0.40 0.15 60)" }}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    ⚠️ Esta profissional não tem serviços configurados. O bot não conseguirá agendar para ela.
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                {services.map((s) => {
                  const on = allowed.includes(s.name);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <span className="text-sm text-foreground flex items-center gap-2">
                        <span>{on ? "✅" : "❌"}</span>
                        {s.name}
                        {!on && <span className="text-xs text-muted-foreground">(não faz)</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSpecialty(emp.id, s.name)}
                        className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                        style={{
                          background: on ? "var(--gradient-rose-gold)" : "var(--secondary)",
                        }}
                      >
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform"
                          style={{ transform: on ? "translateX(20px)" : "translateX(3px)" }}
                        />
                      </button>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
