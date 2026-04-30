import { useSyncExternalStore } from "react";

export type Profile = "owner" | "employee";

const KEY = "demo_profile_v1";
const listeners = new Set<() => void>();
let cache: Profile | null = null;

function read(): Profile {
  if (cache) return cache;
  if (typeof window === "undefined") return "owner";
  try {
    const raw = localStorage.getItem(KEY) as Profile | null;
    cache = raw === "employee" ? "employee" : "owner";
  } catch {
    cache = "owner";
  }
  return cache!;
}

export function setProfile(p: Profile) {
  cache = p;
  if (typeof window !== "undefined") localStorage.setItem(KEY, p);
  listeners.forEach((l) => l());
}

export function useProfile(): Profile {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "owner"
  );
}

export const EMPLOYEE_NAME = "Carla";
