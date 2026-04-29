export const DEMO_CLIENTS = [
  { id: 1, name: "Ana Silva", phone: "(11) 98765-4321", visits: 12, lastVisit: "2 dias atrás" },
  { id: 2, name: "Juliana Costa", phone: "(11) 99123-4567", visits: 8, lastVisit: "1 semana atrás" },
  { id: 3, name: "Fernanda Lima", phone: "(11) 97654-3210", visits: 15, lastVisit: "3 dias atrás" },
  { id: 4, name: "Beatriz Souza", phone: "(11) 98877-6655", visits: 5, lastVisit: "2 semanas atrás" },
  { id: 5, name: "Camila Oliveira", phone: "(11) 99988-7766", visits: 22, lastVisit: "ontem" },
  { id: 6, name: "Mariana Santos", phone: "(11) 96543-2109", visits: 9, lastVisit: "5 dias atrás" },
  { id: 7, name: "Patricia Rocha", phone: "(11) 95432-1098", visits: 18, lastVisit: "hoje" },
  { id: 8, name: "Renata Ferreira", phone: "(11) 94321-0987", visits: 6, lastVisit: "1 mês atrás" },
  { id: 9, name: "Larissa Mendes", phone: "(11) 93210-9876", visits: 11, lastVisit: "4 dias atrás" },
  { id: 10, name: "Gabriela Alves", phone: "(11) 92109-8765", visits: 14, lastVisit: "ontem" },
];

export const DEMO_SERVICES = [
  { id: 1, name: "Corte Feminino", price: 80, duration: 45 },
  { id: 2, name: "Escova Progressiva", price: 220, duration: 120 },
  { id: 3, name: "Coloração", price: 180, duration: 90 },
  { id: 4, name: "Manicure", price: 45, duration: 30 },
  { id: 5, name: "Pedicure", price: 55, duration: 40 },
  { id: 6, name: "Sobrancelha Design", price: 35, duration: 20 },
  { id: 7, name: "Hidratação Capilar", price: 120, duration: 60 },
  { id: 8, name: "Barba", price: 40, duration: 30 },
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function buildAppointments() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const out: { id: number; clientName: string; service: string; price: number; day: string; date: string; time: string; isToday: boolean }[] = [];
  let id = 1;
  for (let d = 0; d < 7; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const isToday = date.toDateString() === today.toDateString();
    const count = isToday ? 8 : 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const c = DEMO_CLIENTS[(id + i) % DEMO_CLIENTS.length];
      const s = DEMO_SERVICES[(id * 3 + i) % DEMO_SERVICES.length];
      const hour = 9 + i + Math.floor(i / 4);
      out.push({
        id: id++,
        clientName: c.name,
        service: s.name,
        price: s.price,
        day: WEEK_DAYS[d],
        date: date.toLocaleDateString("pt-BR"),
        time: `${String(hour).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
        isToday,
      });
    }
  }
  return out;
}

export const DEMO_APPOINTMENTS = buildAppointments();

export const DEMO_STATS = {
  todayAppointments: 8,
  activeClients: 47,
  monthlyRevenue: 4380,
  returnRate: 73,
};

export type Lead = {
  id: string;
  salonName: string;
  contactName: string;
  whatsapp: string;
  city: string;
  plan?: string;
  createdAt: string;
};

const LEADS_KEY = "demo_leads_v1";

export function getLeads(): Lead[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveLead(lead: Omit<Lead, "id" | "createdAt">): Lead {
  const full: Lead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const all = getLeads();
  all.unshift(full);
  localStorage.setItem(LEADS_KEY, JSON.stringify(all));
  return full;
}

export function leadsToCSV(leads: Lead[]): string {
  const header = "Salão,Responsável,WhatsApp,Cidade,Plano,Data\n";
  const rows = leads
    .map((l) =>
      [l.salonName, l.contactName, l.whatsapp, l.city, l.plan || "", new Date(l.createdAt).toLocaleString("pt-BR")]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");
  return header + rows;
}
