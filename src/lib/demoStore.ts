import { useSyncExternalStore } from "react";
import { DEMO_APPOINTMENTS, DEMO_SERVICES } from "./demoData";

export type AppointmentStatus = "confirmado" | "pendente" | "cancelado";

export type Appointment = {
  id: string;
  clientName: string;
  phone: string;
  service: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  status: AppointmentStatus;
};

export type Service = {
  id: string;
  name: string;
  category: "Cabelo" | "Unhas" | "Estética" | "Barba";
  price: number;
  duration: number;
  description?: string;
};

const APP_KEY = "demo_appointments_v1";
const SVC_KEY = "demo_services_v1";

function categorize(name: string): Service["category"] {
  const n = name.toLowerCase();
  if (n.includes("unha") || n.includes("manicure") || n.includes("pedicure")) return "Unhas";
  if (n.includes("barba")) return "Barba";
  if (n.includes("sobrancelha") || n.includes("limpeza") || n.includes("massa")) return "Estética";
  return "Cabelo";
}

const SEED_SERVICES: Service[] = DEMO_SERVICES.map((s) => ({
  id: String(s.id),
  name: s.name,
  category: categorize(s.name),
  price: s.price,
  duration: s.duration,
}));

const SEED_APPOINTMENTS: Appointment[] = DEMO_APPOINTMENTS.slice(0, 20).map((a) => {
  // a.date is dd/mm/yyyy in pt-BR
  const [d, m, y] = a.date.split("/");
  return {
    id: String(a.id),
    clientName: a.clientName,
    phone: "(11) 99999-9999",
    service: a.service,
    price: a.price,
    date: `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`,
    time: a.time,
    status: (a.id % 4 === 0 ? "pendente" : "confirmado") as AppointmentStatus,
  };
});

function makeStore<T>(key: string, seed: T[]) {
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;

  const read = (): T[] => {
    if (cache) return cache;
    if (typeof window === "undefined") return seed;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? JSON.parse(raw) : seed;
      if (!raw) localStorage.setItem(key, JSON.stringify(seed));
    } catch {
      cache = seed;
    }
    return cache!;
  };

  const write = (next: T[]) => {
    cache = next;
    if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(next));
    listeners.forEach((l) => l());
  };

  return {
    get: read,
    set: write,
    subscribe: (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    use(): T[] {
      return useSyncExternalStore(
        (cb) => {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        read,
        () => seed
      );
    },
  };
}

export const appointmentsStore = makeStore<Appointment>(APP_KEY, SEED_APPOINTMENTS);
export const servicesStore = makeStore<Service>(SVC_KEY, SEED_SERVICES);

export function addAppointment(a: Omit<Appointment, "id" | "status">) {
  const next: Appointment = { ...a, id: crypto.randomUUID(), status: "confirmado" };
  appointmentsStore.set([next, ...appointmentsStore.get()]);
  return next;
}

export function setAppointmentStatus(id: string, status: AppointmentStatus) {
  appointmentsStore.set(appointmentsStore.get().map((a) => (a.id === id ? { ...a, status } : a)));
}

export function addService(s: Omit<Service, "id">) {
  const next: Service = { ...s, id: crypto.randomUUID() };
  servicesStore.set([next, ...servicesStore.get()]);
  return next;
}

export function updateService(id: string, patch: Partial<Service>) {
  servicesStore.set(servicesStore.get().map((s) => (s.id === id ? { ...s, ...patch } : s)));
}

export function deleteService(id: string) {
  servicesStore.set(servicesStore.get().filter((s) => s.id !== id));
}

export const CATEGORY_COLORS: Record<Service["category"], string> = {
  Cabelo: "oklch(0.85 0.10 30)",
  Unhas: "oklch(0.85 0.12 350)",
  Estética: "oklch(0.85 0.10 280)",
  Barba: "oklch(0.85 0.08 200)",
};
