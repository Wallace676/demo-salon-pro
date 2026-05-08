import { useEffect, useState } from "react";

export type LeadStatus = "novo" | "em_contato" | "convertido" | "perdido";

export type Lead = {
  id: number;
  nomeSalao: string;
  nomeResponsavel: string;
  whatsapp: string;
  cidade: string;
  plano: string;
  comoEncontrou: string;
  dataHora: string; // dd/mm/yyyy hh:mm
  createdAt: number; // timestamp ms
  status: LeadStatus;
  lido: boolean;
  notas?: string;
  history?: { at: string; label: string }[];
};

const KEY = "leads";

export const PLANO_OPTIONS = [
  { value: "Quero ser dono — R$2.500 único", label: "🏆 Quero ser dono — R$2.500 único" },
  { value: "Profissional — R$129/mês", label: "💅 Profissional — R$129/mês" },
  { value: "Anual Pro — R$119/mês", label: "🌟 Anual Pro — R$119/mês" },
  { value: "Ainda não sei, quero conversar", label: "🤔 Ainda não sei, quero conversar" },
];

export const COMO_ENCONTROU_OPTIONS = [
  "📱 Instagram",
  "🔍 Google",
  "👥 Indicação de amigo",
  "💬 WhatsApp",
  "🎯 Outro",
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "🔴 Novo",
  em_contato: "🟡 Em contato",
  convertido: "✅ Convertido",
  perdido: "❌ Perdido",
};

const PLANO_VALUE: Record<string, number> = {
  "Quero ser dono — R$2.500 único": 2500,
  "Profissional — R$129/mês": 129 * 12,
  "Anual Pro — R$119/mês": 119 * 12,
  "Ainda não sei, quero conversar": 0,
};

export function leadValue(plano: string): number {
  return PLANO_VALUE[plano] ?? 0;
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function seedData(): Lead[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const seeds: Array<Omit<Lead, "id" | "createdAt" | "dataHora" | "lido" | "history">> = [
    { nomeSalao: "Espaço Bella SP", nomeResponsavel: "Ana Silva", whatsapp: "(11) 98765-4321", cidade: "São Paulo - SP", plano: "Profissional — R$129/mês", comoEncontrou: "📱 Instagram", status: "novo" },
    { nomeSalao: "Studio Rose RJ", nomeResponsavel: "Carla Mendes", whatsapp: "(21) 97654-3210", cidade: "Rio de Janeiro - RJ", plano: "Anual Pro — R$119/mês", comoEncontrou: "🔍 Google", status: "em_contato" },
    { nomeSalao: "Salão Top MG", nomeResponsavel: "Maria Santos", whatsapp: "(31) 96543-2109", cidade: "Belo Horizonte - MG", plano: "Quero ser dono — R$2.500 único", comoEncontrou: "👥 Indicação de amigo", status: "convertido" },
    { nomeSalao: "Beauty House PR", nomeResponsavel: "Patricia Lima", whatsapp: "(41) 95432-1098", cidade: "Curitiba - PR", plano: "Profissional — R$129/mês", comoEncontrou: "📱 Instagram", status: "convertido" },
    { nomeSalao: "Espaço Zen RS", nomeResponsavel: "Fernanda Costa", whatsapp: "(51) 94321-0987", cidade: "Porto Alegre - RS", plano: "Ainda não sei, quero conversar", comoEncontrou: "💬 WhatsApp", status: "em_contato" },
    { nomeSalao: "Studio Gold BA", nomeResponsavel: "Juliana Rocha", whatsapp: "(71) 93210-9876", cidade: "Salvador - BA", plano: "Anual Pro — R$119/mês", comoEncontrou: "🔍 Google", status: "novo" },
    { nomeSalao: "Salão VIP CE", nomeResponsavel: "Renata Ferreira", whatsapp: "(85) 92109-8765", cidade: "Fortaleza - CE", plano: "Profissional — R$129/mês", comoEncontrou: "📱 Instagram", status: "perdido" },
    { nomeSalao: "Espaço Luxe SP", nomeResponsavel: "Camila Alves", whatsapp: "(11) 91098-7654", cidade: "São Paulo - SP", plano: "Quero ser dono — R$2.500 único", comoEncontrou: "👥 Indicação de amigo", status: "convertido" },
  ];
  const offsets = [0, 1, 1, 2, 3, 4, 5, 6];
  return seeds.map((s, i) => {
    const ts = now - offsets[i] * day - i * 1000;
    return {
      ...s,
      id: ts,
      createdAt: ts,
      dataHora: fmtDate(ts),
      lido: s.status !== "novo",
      history: [{ at: fmtDate(ts), label: "Lead capturado" }],
    };
  });
}

function read(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch {
    // ignore
  }
  const seeded = seedData();
  try {
    localStorage.setItem(KEY, JSON.stringify(seeded));
  } catch {
    // ignore
  }
  return seeded;
}

function write(leads: Lead[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(leads));
  } catch {
    // ignore
  }
}

type Listener = (leads: Lead[]) => void;
const listeners = new Set<Listener>();
let cache: Lead[] | null = null;

function getAll(): Lead[] {
  if (cache === null) cache = read();
  return cache;
}

function emit() {
  if (cache) write(cache);
  listeners.forEach((l) => l(cache ?? []));
}

export const leadsStore = {
  get: getAll,
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export function useLeads(): Lead[] {
  const [leads, setLeads] = useState<Lead[]>(() => (typeof window === "undefined" ? [] : getAll()));
  useEffect(() => {
    setLeads(getAll());
    const unsub = leadsStore.subscribe(setLeads);
    return () => {
      unsub();
    };
  }, []);
  return leads;
}

export type NewLeadInput = {
  nomeSalao: string;
  nomeResponsavel: string;
  whatsapp: string;
  cidade: string;
  plano: string;
  comoEncontrou: string;
};

export function addLead(input: NewLeadInput): Lead {
  const ts = Date.now();
  const lead: Lead = {
    ...input,
    id: ts,
    createdAt: ts,
    dataHora: fmtDate(ts),
    status: "novo",
    lido: false,
    history: [{ at: fmtDate(ts), label: "Lead capturado" }],
  };
  cache = [lead, ...getAll()];
  emit();
  return lead;
}

export function updateLeadStatus(id: number, status: LeadStatus) {
  cache = getAll().map((l) =>
    l.id === id
      ? {
          ...l,
          status,
          lido: true,
          history: [...(l.history ?? []), { at: fmtDate(Date.now()), label: STATUS_LABEL[status].replace(/^[^\s]+\s/, "") }],
        }
      : l,
  );
  emit();
}

export function markLeadRead(id: number) {
  cache = getAll().map((l) => (l.id === id ? { ...l, lido: true } : l));
  emit();
}

export function markAllLeadsRead() {
  cache = getAll().map((l) => ({ ...l, lido: true }));
  emit();
}

export function updateLeadNotes(id: number, notas: string) {
  cache = getAll().map((l) => (l.id === id ? { ...l, notas } : l));
  emit();
}

export function deleteLead(id: number) {
  cache = getAll().filter((l) => l.id !== id);
  emit();
}

export function leadsToCSV(leads: Lead[]): string {
  const header = "Data,Salão,Responsável,WhatsApp,Cidade,Plano,Como encontrou,Status\n";
  const rows = leads
    .map((l) =>
      [l.dataHora, l.nomeSalao, l.nomeResponsavel, l.whatsapp, l.cidade, l.plano, l.comoEncontrou, STATUS_LABEL[l.status]]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  return header + rows;
}

export function leadsStats(leads: Lead[]) {
  const total = leads.length;
  const todayKey = new Date().toLocaleDateString("pt-BR");
  const novosHoje = leads.filter((l) => new Date(l.createdAt).toLocaleDateString("pt-BR") === todayKey).length;
  const convertidos = leads.filter((l) => l.status === "convertido").length;
  const conversao = total > 0 ? Math.round((convertidos / total) * 100) : 0;
  const receitaPotencial = leads
    .filter((l) => l.status === "novo" || l.status === "em_contato")
    .reduce((s, l) => s + leadValue(l.plano), 0);
  return { total, novosHoje, conversao, receitaPotencial };
}
