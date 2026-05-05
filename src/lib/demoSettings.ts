import { useEffect, useSyncExternalStore } from "react";

export type ThemeName = "rose" | "purple" | "emerald";

export type WorkingHours = {
  [day: string]: { open: boolean; from: string; to: string };
};

export type DemoSettings = {
  salonName: string;
  ownerName: string;
  logoDataUrl: string | null;
  theme: ThemeName;
  hours: WorkingHours;
};

export const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;

const DEFAULTS: DemoSettings = {
  salonName: "Salão Bella",
  ownerName: "Bella",
  logoDataUrl: null,
  theme: "rose",
  hours: Object.fromEntries(
    DAYS.map((d) => [d, { open: d !== "Dom", from: "08:00", to: "20:00" }])
  ) as WorkingHours,
};

const KEY = "demo_settings_v1";

const listeners = new Set<() => void>();
let cache: DemoSettings | null = null;

function read(): DemoSettings {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    cache = DEFAULTS;
  }
  return cache!;
}

export function getSettings(): DemoSettings {
  return read();
}

export function updateSettings(patch: Partial<DemoSettings>) {
  const next = { ...read(), ...patch };
  cache = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(next));
    applyTheme(next.theme);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): DemoSettings {
  const snap = useSyncExternalStore(subscribe, read, () => DEFAULTS);
  useEffect(() => {
    applyTheme(snap.theme);
  }, [snap.theme]);
  return snap;
}

const THEMES: Record<ThemeName, { rose: string; light: string; dark: string; gradient: string; soft: string; shadow: string }> = {
  rose: {
    rose: "oklch(0.74 0.10 45)",
    light: "oklch(0.85 0.07 50)",
    dark: "oklch(0.55 0.12 35)",
    gradient: "linear-gradient(135deg, oklch(0.78 0.10 50), oklch(0.62 0.13 35))",
    soft: "linear-gradient(135deg, oklch(0.96 0.03 50), oklch(0.92 0.05 40))",
    shadow: "0 10px 40px -10px oklch(0.65 0.13 35 / 0.45)",
  },
  purple: {
    rose: "oklch(0.62 0.18 305)",
    light: "oklch(0.80 0.10 305)",
    dark: "oklch(0.45 0.20 305)",
    gradient: "linear-gradient(135deg, oklch(0.70 0.18 310), oklch(0.45 0.22 295))",
    soft: "linear-gradient(135deg, oklch(0.95 0.04 305), oklch(0.92 0.06 295))",
    shadow: "0 10px 40px -10px oklch(0.50 0.22 305 / 0.45)",
  },
  emerald: {
    rose: "oklch(0.65 0.15 165)",
    light: "oklch(0.82 0.10 160)",
    dark: "oklch(0.45 0.15 160)",
    gradient: "linear-gradient(135deg, oklch(0.70 0.15 160), oklch(0.48 0.16 155))",
    soft: "linear-gradient(135deg, oklch(0.95 0.04 160), oklch(0.92 0.06 155))",
    shadow: "0 10px 40px -10px oklch(0.55 0.16 160 / 0.45)",
  },
};

export function applyTheme(name: ThemeName) {
  if (typeof document === "undefined") return;
  const t = THEMES[name];
  const r = document.documentElement.style;
  r.setProperty("--rose-gold", t.rose);
  r.setProperty("--rose-gold-light", t.light);
  r.setProperty("--rose-gold-dark", t.dark);
  r.setProperty("--gradient-rose-gold", t.gradient);
  r.setProperty("--gradient-rose-soft", t.soft);
  r.setProperty("--shadow-rose", t.shadow);
}

export const THEME_OPTIONS: { value: ThemeName; label: string; preview: string }[] = [
  { value: "rose", label: "Rose Gold", preview: THEMES.rose.gradient },
  { value: "purple", label: "Roxo Luxo", preview: THEMES.purple.gradient },
  { value: "emerald", label: "Verde Esmeralda", preview: THEMES.emerald.gradient },
];
