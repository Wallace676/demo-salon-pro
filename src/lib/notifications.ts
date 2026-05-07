import { useSyncExternalStore } from "react";

export type Notification = {
  id: string;
  type: "transfer" | "new_appointment" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
  actions?: ("accept" | "decline" | "view")[];
};

const KEY = "demo_employee_notifs_v1";
const listeners = new Set<() => void>();
let cache: Notification[] | null = null;

const SEED: Notification[] = [
  {
    id: "n1",
    type: "new_appointment",
    title: "📅 Novo agendamento adicionado",
    body: "Beatriz Souza — amanhã 10h • Manicure",
    time: "agora",
    read: false,
    actions: ["view"],
  },
];

function read(): Notification[] {
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

function write(next: Notification[]) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useNotifications() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => SEED
  );
}

export function addNotification(n: Omit<Notification, "id" | "time" | "read">) {
  const next: Notification = { ...n, id: crypto.randomUUID(), time: "agora", read: false };
  write([next, ...read()]);
}

export function markAllRead() {
  write(read().map((n) => ({ ...n, read: true })));
}

export function removeNotification(id: string) {
  write(read().filter((n) => n.id !== id));
}
