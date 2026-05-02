import { useSyncExternalStore } from "react";

export type ClientMemory = {
  clientName: string;
  lastService?: {
    service: string;
    professional: string;
    date: string; // YYYY-MM-DD
    polish?: string;
    note?: string;
  };
  tags: string[];
  averageReturnDays?: number;
  history: { service: string; professional: string; date: string }[];
  remindersEnabled: boolean;
};

const KEY = "demo_client_memory_v1";
const listeners = new Set<() => void>();
let cache: Record<string, ClientMemory> | null = null;

const SEED: Record<string, ClientMemory> = {
  "Ana Silva": {
    clientName: "Ana Silva",
    lastService: {
      service: "Manicure",
      professional: "Carla",
      date: "2026-04-15",
      polish: "Rosa nude 🌸",
      note: "Prefere lixar pouco",
    },
    tags: [
      "Profissional preferida: Carla",
      "Serviço favorito: Manicure",
      "Frequência média: 3 semanas",
      "Esmalte favorito: Rosa nude",
    ],
    averageReturnDays: 21,
    history: [
      { service: "Manicure", professional: "Carla", date: "2026-04-15" },
      { service: "Manicure", professional: "Carla", date: "2026-03-25" },
      { service: "Manicure", professional: "Carla", date: "2026-03-04" },
    ],
    remindersEnabled: true,
  },
  "Camila Oliveira": {
    clientName: "Camila Oliveira",
    lastService: {
      service: "Escova",
      professional: "Juliana",
      date: "2026-04-20",
      note: "Gosta de finalização lisa",
    },
    tags: [
      "Profissional preferida: Juliana",
      "Serviço favorito: Escova",
      "Frequência média: 2 semanas",
    ],
    averageReturnDays: 14,
    history: [
      { service: "Escova", professional: "Juliana", date: "2026-04-20" },
      { service: "Escova", professional: "Juliana", date: "2026-04-06" },
    ],
    remindersEnabled: true,
  },
};

function read(): Record<string, ClientMemory> {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : SEED;
    if (!raw) localStorage.setItem(KEY, JSON.stringify(SEED));
  } catch {
    cache = SEED;
  }
  return cache!;
}

function write(next: Record<string, ClientMemory>) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useClientMemory(): Record<string, ClientMemory> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => SEED
  );
}

export function getClientMemory(name: string): ClientMemory | undefined {
  return read()[name];
}

export function upsertClientVisit(input: {
  clientName: string;
  service: string;
  professional: string;
  date: string;
  note?: string;
}) {
  const all = { ...read() };
  const prev = all[input.clientName];
  const history = [
    { service: input.service, professional: input.professional, date: input.date },
    ...(prev?.history || []),
  ].slice(0, 20);

  // recompute average return interval (days) from history dates
  let avg = prev?.averageReturnDays;
  if (history.length >= 2) {
    const sorted = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));
    const diffs: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i].date + "T00:00:00").getTime();
      const d2 = new Date(sorted[i + 1].date + "T00:00:00").getTime();
      diffs.push(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));
    }
    if (diffs.length > 0) {
      avg = Math.max(7, Math.round(diffs.reduce((s, x) => s + x, 0) / diffs.length));
    }
  }

  all[input.clientName] = {
    clientName: input.clientName,
    lastService: {
      service: input.service,
      professional: input.professional,
      date: input.date,
      note: input.note,
      polish: prev?.lastService?.polish,
    },
    tags: prev?.tags || [
      `Profissional preferida: ${input.professional}`,
      `Serviço favorito: ${input.service}`,
    ],
    averageReturnDays: avg,
    history,
    remindersEnabled: prev?.remindersEnabled ?? true,
  };
  write(all);
}

export function setClientMemory(name: string, patch: Partial<ClientMemory>) {
  const all = { ...read() };
  const prev = all[name];
  if (!prev) return;
  all[name] = { ...prev, ...patch };
  write(all);
}

export function addClientTag(name: string, tag: string) {
  const all = { ...read() };
  const prev = all[name];
  if (!prev) return;
  if (prev.tags.includes(tag)) return;
  all[name] = { ...prev, tags: [...prev.tags, tag] };
  write(all);
}

export function removeClientTag(name: string, tag: string) {
  const all = { ...read() };
  const prev = all[name];
  if (!prev) return;
  all[name] = { ...prev, tags: prev.tags.filter((t) => t !== tag) };
  write(all);
}

export type ScheduledMessage = {
  daysAfter: number;
  label: string;
  text: string;
  sendDate: string; // YYYY-MM-DD
};

export function buildScheduledMessages(mem: ClientMemory): ScheduledMessage[] {
  if (!mem.lastService || !mem.averageReturnDays) return [];
  const baseDays = mem.averageReturnDays;
  const lastDate = new Date(mem.lastService.date + "T00:00:00");
  const prof = mem.lastService.professional;
  const polish = mem.lastService.polish ? ` (${mem.lastService.polish})` : "";

  const compose = (daysAfter: number, label: string, text: string): ScheduledMessage => {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + daysAfter);
    return { daysAfter, label, text, sendDate: d.toISOString().slice(0, 10) };
  };

  return [
    compose(
      baseDays - 3,
      `Dia ${baseDays - 3} — 3 dias antes do retorno`,
      `Oi ${mem.clientName.split(" ")[0]}! 💅 Tá na hora de dar aquele trato nas unhas? A ${prof} tem horário disponível essa semana! Quer agendar? 😊`
    ),
    compose(
      baseDays,
      `Dia ${baseDays} — dia do retorno habitual`,
      `${mem.clientName.split(" ")[0]}, sumiu! 😄 Seu horário favorito com a ${prof}${polish} tá esperando por você 💛 Que tal hoje ou amanhã?`
    ),
    compose(
      baseDays + 4,
      `Dia ${baseDays + 4} — retorno atrasado`,
      `${mem.clientName.split(" ")[0]}, temos uma promoção especial pra você! 🎁 Manicure + Pedicure com 10% off só essa semana. Bora? 💅`
    ),
  ];
}
