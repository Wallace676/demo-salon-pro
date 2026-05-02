import { useSyncExternalStore } from "react";

const KEY = "demo_employee_specialties_v1";
const listeners = new Set<() => void>();
let cache: Record<string, string[]> | null = null;

// service names allowed per employee id
const SEED: Record<string, string[]> = {
  carla: ["Manicure", "Pedicure", "Sobrancelha Design", "Corte Feminino"],
  juliana: ["Corte Feminino", "Escova Progressiva", "Coloração", "Hidratação Capilar"],
  patricia: ["Manicure", "Pedicure", "Sobrancelha Design"],
  renata: ["Corte Feminino", "Hidratação Capilar"],
  gabriela: ["Sobrancelha Design", "Manicure"],
};

function read(): Record<string, string[]> {
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

function write(next: Record<string, string[]>) {
  cache = next;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useEmployeeSpecialties() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => SEED
  );
}

export function toggleSpecialty(employeeId: string, service: string) {
  const all = { ...read() };
  const list = all[employeeId] || [];
  all[employeeId] = list.includes(service)
    ? list.filter((s) => s !== service)
    : [...list, service];
  write(all);
}

export function getEmployeesForService(service: string, allEmployees: { id: string; name: string }[]) {
  const map = read();
  return allEmployees.filter((e) => (map[e.id] || []).includes(service));
}
