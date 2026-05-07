import { useSyncExternalStore } from "react";

const KEY = "demo_employee_durations_v1";
const listeners = new Set<() => void>();
let cache: Record<string, Record<string, number>> | null = null;

// employeeId → { serviceName: minutes }
const SEED: Record<string, Record<string, number>> = {
  carla: { Manicure: 25, Pedicure: 35, "Sobrancelha Design": 18, "Corte Feminino": 40 },
  juliana: { "Corte Feminino": 45, "Escova Progressiva": 110, Coloração: 90, "Hidratação Capilar": 55 },
  patricia: { Manicure: 30, Pedicure: 40, "Sobrancelha Design": 20 },
  renata: { "Corte Feminino": 50, "Hidratação Capilar": 60 },
  gabriela: { "Sobrancelha Design": 22, Manicure: 32 },
};

function read(): Record<string, Record<string, number>> {
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

function write(next: Record<string, Record<string, number>>) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useEmployeeDurations() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => SEED
  );
}

export function setEmployeeDuration(employeeId: string, service: string, minutes: number) {
  const all = { ...read() };
  all[employeeId] = { ...(all[employeeId] || {}), [service]: minutes };
  write(all);
}

export function getDurationFor(employeeId: string, service: string, fallback: number): number {
  const all = read();
  return all[employeeId]?.[service] ?? fallback;
}
