import { useMemo, useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { TEAM, teamColor } from "@/lib/demoProfessionals";
import { getEmployeesForService } from "@/lib/employeeSpecialties";
import { getDurationFor } from "@/lib/employeeDurations";
import { addNotification } from "@/lib/notifications";
import { EMPLOYEE_NAME } from "@/lib/demoProfile";

export type ScheduleItem = {
  id: string;
  employeeId: string;
  client: string;
  service: string;
  startMin: number; // minutes from 08:00
};

const TEAM_BY_NAME = Object.fromEntries(TEAM.map((t) => [t.name, t]));

export function categoryColor(service: string): string {
  const n = service.toLowerCase();
  if (n.includes("manicure") || n.includes("pedicure") || n.includes("unha"))
    return "oklch(0.85 0.12 350)";
  if (n.includes("sobrancelha") || n.includes("limpeza") || n.includes("massa"))
    return "oklch(0.86 0.10 145)";
  if (n.includes("barba")) return "oklch(0.84 0.08 230)";
  return "oklch(0.85 0.10 295)";
}

export function fmtMin(min: number): string {
  const h = 8 + Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 08-20
const MINUTES_TOTAL = 12 * 60; // 08:00 → 20:00
const PX_PER_MIN = 1.4;

const TODAY_SCHEDULE: ScheduleItem[] = [
  { id: "s1", employeeId: "carla", client: "Ana Silva", service: "Manicure", startMin: 60 }, // 09:00
  { id: "s2", employeeId: "carla", client: "Fernanda Lima", service: "Pedicure", startMin: 150 }, // 10:30
  { id: "s3", employeeId: "carla", client: "Camila Oliveira", service: "Manicure", startMin: 360 }, // 14:00
  { id: "s4", employeeId: "juliana", client: "Beatriz Souza", service: "Coloração", startMin: 60 },
  { id: "s5", employeeId: "juliana", client: "Patricia Rocha", service: "Escova Progressiva", startMin: 180 }, // 11:00
  { id: "s6", employeeId: "patricia", client: "Camila Oliveira", service: "Sobrancelha Design", startMin: 150 },
  { id: "s7", employeeId: "patricia", client: "Larissa Mendes", service: "Manicure", startMin: 240 }, // 12:00
  { id: "s8", employeeId: "renata", client: "Mariana Santos", service: "Hidratação Capilar", startMin: 120 }, // 10:00
  { id: "s9", employeeId: "gabriela", client: "Ana Silva", service: "Sobrancelha Design", startMin: 60 },
  { id: "s10", employeeId: "gabriela", client: "Beatriz Souza", service: "Manicure", startMin: 300 }, // 13:00
];

const CURRENT_EMP_ID = "carla"; // employee profile = Carla (matches EMPLOYEE_NAME)

export function TeamSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>(TODAY_SCHEDULE);
  const [transferring, setTransferring] = useState<ScheduleItem | null>(null);
  const [addingFor, setAddingFor] = useState<{ employeeId: string; startMin: number } | null>(null);

  const handleTransfer = (item: ScheduleItem, toEmpId: string) => {
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, employeeId: toEmpId } : x)));
    setTransferring(null);
    const toName = TEAM.find((t) => t.id === toEmpId)?.name || "colega";
    toast.success(`Transferido para ${toName}! ✅`);
    addNotification({
      type: "transfer",
      title: `🔄 ${EMPLOYEE_NAME} transferiu ${item.client}`,
      body: `${item.service} — ${fmtMin(item.startMin)} agora com ${toName}`,
      actions: ["view"],
    });
  };

  const handleAddFor = (employeeId: string, startMin: number, client: string, service: string) => {
    const dur = getDurationFor(employeeId, service, 30);
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), employeeId, client, service, startMin },
    ]);
    const empName = TEAM.find((t) => t.id === employeeId)?.name || "colega";
    toast.success(`Adicionado para ${empName} (${dur}min)`);
    addNotification({
      type: "new_appointment",
      title: "📅 Novo agendamento adicionado",
      body: `${client} — hoje ${fmtMin(startMin)} • ${service}\n(adicionado por ${EMPLOYEE_NAME})`,
      actions: ["view"],
    });
    setAddingFor(null);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">👥 Agenda da Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Veja a agenda de todas as colegas hoje. Você só edita a sua coluna.
        </p>
      </div>

      <div
        className="rounded-xl border border-border bg-card p-3 overflow-x-auto"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex gap-2 min-w-[640px]">
          {/* Hour labels */}
          <div className="shrink-0 pt-10 w-12 text-right">
            {HOURS.map((h) => (
              <div
                key={h}
                className="text-[10px] text-muted-foreground"
                style={{ height: 60 * PX_PER_MIN }}
              >
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {TEAM.map((emp) => {
            const isMe = emp.id === CURRENT_EMP_ID;
            const empItems = items.filter((i) => i.employeeId === emp.id);
            return (
              <div key={emp.id} className="flex-1 min-w-[120px]">
                <div
                  className="h-10 mb-1 rounded-md flex items-center justify-center gap-1.5 text-xs font-semibold text-white sticky top-0"
                  style={{ background: emp.color }}
                >
                  <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px]">
                    {emp.name.charAt(0)}
                  </span>
                  {emp.name}
                  {isMe && <span className="text-[9px] opacity-90">(você)</span>}
                </div>

                <div
                  className="relative rounded-lg border border-border"
                  style={{
                    height: MINUTES_TOTAL * PX_PER_MIN,
                    background: isMe
                      ? "linear-gradient(180deg, oklch(0.99 0.012 25), oklch(0.97 0.015 25))"
                      : "oklch(0.985 0.005 280)",
                  }}
                >
                  {/* Hour gridlines */}
                  {HOURS.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-border/50"
                      style={{ top: i * 60 * PX_PER_MIN }}
                    />
                  ))}

                  {/* Free slot click areas (every 30min) */}
                  {!isMe &&
                    Array.from({ length: 24 }, (_, i) => i * 30).map((startMin) => {
                      const occupied = empItems.some((it) => {
                        const dur = getDurationFor(emp.id, it.service, 30);
                        return startMin >= it.startMin && startMin < it.startMin + dur;
                      });
                      if (occupied) return null;
                      return (
                        <button
                          key={startMin}
                          onClick={() => setAddingFor({ employeeId: emp.id, startMin })}
                          className="absolute left-1 right-1 rounded text-[9px] text-emerald-700/70 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                          style={{ top: startMin * PX_PER_MIN, height: 30 * PX_PER_MIN - 1 }}
                          title={`+ Adicionar para ${emp.name}`}
                        >
                          +
                        </button>
                      );
                    })}

                  {empItems.map((item) => {
                    const dur = getDurationFor(emp.id, item.service, 30);
                    const top = item.startMin * PX_PER_MIN;
                    const height = dur * PX_PER_MIN - 2;
                    const bg = categoryColor(item.service);
                    return (
                      <div
                        key={item.id}
                        className="absolute left-1 right-1 rounded-md p-1.5 text-[10px] overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                        style={{ top, height, background: bg, color: "oklch(0.25 0.10 30)" }}
                        title={`${item.client} — ${item.service} (${dur}min)`}
                      >
                        <div className="font-semibold truncate">{item.client}</div>
                        <div className="opacity-80 truncate">{item.service}</div>
                        <div className="opacity-70 text-[9px]">
                          {fmtMin(item.startMin)} • {dur}min
                        </div>
                        {isMe && (
                          <button
                            onClick={() => setTransferring(item)}
                            className="absolute top-0.5 right-0.5 p-0.5 rounded bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Transferir"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <Legend color="oklch(0.85 0.10 295)" label="Cabelo" />
        <Legend color="oklch(0.85 0.12 350)" label="Unhas" />
        <Legend color="oklch(0.86 0.10 145)" label="Estética" />
        <Legend color="oklch(0.84 0.08 230)" label="Barba" />
        <span className="ml-auto">Passe o mouse num horário livre para adicionar</span>
      </div>

      {transferring && (
        <TransferModal
          item={transferring}
          onClose={() => setTransferring(null)}
          onTransfer={(toId) => handleTransfer(transferring, toId)}
          allItems={items}
        />
      )}
      {addingFor && (
        <AddForColleagueModal
          employeeId={addingFor.employeeId}
          startMin={addingFor.startMin}
          onClose={() => setAddingFor(null)}
          onConfirm={(client, service) => handleAddFor(addingFor.employeeId, addingFor.startMin, client, service)}
        />
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-3 h-3 rounded" style={{ background: color }} />
      {label}
    </span>
  );
}

function TransferModal({
  item,
  onClose,
  onTransfer,
  allItems,
}: {
  item: ScheduleItem;
  onClose: () => void;
  onTransfer: (toEmpId: string) => void;
  allItems: ScheduleItem[];
}) {
  const eligible = useMemo(() => {
    const canDo = getEmployeesForService(item.service, TEAM);
    const pool = canDo.length > 0 ? canDo : TEAM;
    return pool.filter((e) => e.id !== CURRENT_EMP_ID);
  }, [item.service]);

  const isFreeAt = (empId: string) => {
    return !allItems.some((it) => {
      if (it.employeeId !== empId) return false;
      const dur = getDurationFor(empId, it.service, 30);
      return item.startMin < it.startMin + dur && item.startMin + 30 > it.startMin;
    });
  };

  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-border"
        style={{ boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-foreground">Transferir Agendamento</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent" aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-lg p-3 text-sm" style={{ background: "var(--accent)" }}>
            <div><span className="text-muted-foreground">Cliente:</span> <strong>{item.client}</strong></div>
            <div><span className="text-muted-foreground">Serviço:</span> <strong>{item.service}</strong></div>
            <div><span className="text-muted-foreground">Horário:</span> <strong>Hoje {fmtMin(item.startMin)}</strong></div>
          </div>

          <div className="text-sm font-semibold text-foreground">Transferir para:</div>

          <div className="space-y-2">
            {eligible.length === 0 && (
              <div className="text-xs text-muted-foreground">Nenhuma colega habilitada para este serviço.</div>
            )}
            {eligible.map((emp) => {
              const free = isFreeAt(emp.id);
              const active = selected === emp.id;
              return (
                <button
                  key={emp.id}
                  disabled={!free}
                  onClick={() => setSelected(emp.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: active ? "var(--rose-gold)" : "var(--border)",
                    background: active ? "oklch(0.97 0.025 25)" : "var(--card)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: emp.color }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm text-foreground">{emp.name}</div>
                    <div className="text-[11px]" style={{ color: free ? "oklch(0.50 0.15 145)" : "oklch(0.50 0.18 25)" }}>
                      {free ? `Livre às ${fmtMin(item.startMin)} ✅` : `Ocupada às ${fmtMin(item.startMin)} ❌`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            disabled={!selected}
            onClick={() => selected && onTransfer(selected)}
            className="w-full py-3 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
            style={{ background: "var(--gradient-rose-gold)", boxShadow: "var(--shadow-rose)" }}
          >
            Confirmar transferência
          </button>
        </div>
      </div>
    </div>
  );
}

function AddForColleagueModal({
  employeeId,
  startMin,
  onClose,
  onConfirm,
}: {
  employeeId: string;
  startMin: number;
  onClose: () => void;
  onConfirm: (client: string, service: string) => void;
}) {
  const emp = TEAM.find((t) => t.id === employeeId)!;
  const allowedServices = useMemo(() => {
    // gather services this employee can do from durations seed
    const dur = getDurationFor(employeeId, "Manicure", 0);
    void dur;
    const all = ["Manicure", "Pedicure", "Sobrancelha Design", "Corte Feminino", "Hidratação Capilar", "Coloração", "Escova Progressiva"];
    return all.filter((s) => getDurationFor(employeeId, s, 0) > 0);
  }, [employeeId]);
  const [client, setClient] = useState("");
  const [service, setService] = useState(allowedServices[0] || "Manicure");
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto border border-border"
        style={{ boxShadow: "var(--shadow-elegant)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">+ Adicionar cliente para {emp.name}</h2>
            <p className="text-xs text-muted-foreground">Hoje às {fmtMin(startMin)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div
            className="rounded-lg p-3 text-xs border"
            style={{ background: "oklch(0.97 0.04 90)", borderColor: "oklch(0.85 0.10 80)", color: "oklch(0.40 0.15 70)" }}
          >
            ⚠️ Adicionando para <strong>{emp.name}</strong>, não para você.
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Nome da cliente</label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Ex.: Ana Silva"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">Serviço</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {allowedServices.map((s) => (
                <option key={s} value={s}>
                  {s} ({getDurationFor(employeeId, s, 30)}min)
                </option>
              ))}
            </select>
          </div>

          {!confirming ? (
            <button
              disabled={!client.trim()}
              onClick={() => setConfirming(true)}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
              style={{ background: "var(--gradient-rose-gold)" }}
            >
              Continuar
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-foreground">
                Tem certeza? Você está adicionando uma cliente para <strong>{emp.name}</strong>, não para você.
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm">
                  Cancelar
                </button>
                <button
                  onClick={() => onConfirm(client.trim(), service)}
                  className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm"
                  style={{ background: "var(--gradient-rose-gold)" }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
