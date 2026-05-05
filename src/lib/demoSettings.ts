import { useEffect, useSyncExternalStore } from "react";

export type ThemeName =
  | "roxo"
  | "rose"
  | "esmeralda"
  | "safira"
  | "pretoRose"
  | "bordo";

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
  theme: "roxo",
  hours: Object.fromEntries(
    DAYS.map((d) => [d, { open: d !== "Dom", from: "08:00", to: "20:00" }])
  ) as WorkingHours,
};

const KEY = "demo_settings_v1";
const EMP_KEY = "employeeTheme";
const OWNER_KEY = "ownerTheme";

const listeners = new Set<() => void>();
let cache: DemoSettings | null = null;

function migrateTheme(t: unknown): ThemeName {
  if (t === "roxo" || t === "rose" || t === "esmeralda" || t === "safira" || t === "pretoRose" || t === "bordo") return t;
  if (t === "purple") return "roxo";
  if (t === "emerald") return "esmeralda";
  return "roxo";
}

function read(): DemoSettings {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const ownerOverride = localStorage.getItem(OWNER_KEY);
    cache = {
      ...DEFAULTS,
      ...parsed,
      theme: migrateTheme(ownerOverride || parsed?.theme),
    };
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
    if (patch.theme) localStorage.setItem(OWNER_KEY, next.theme);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSettings(): DemoSettings {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

// ---------------- Employee theme (independent) ----------------

const empListeners = new Set<() => void>();
let empCache: ThemeName | null = null;

function readEmployeeTheme(): ThemeName {
  if (empCache) return empCache;
  if (typeof window === "undefined") return "roxo";
  try {
    const raw = localStorage.getItem(EMP_KEY);
    empCache = migrateTheme(raw);
  } catch {
    empCache = "roxo";
  }
  return empCache!;
}

export function setEmployeeTheme(t: ThemeName) {
  empCache = t;
  if (typeof window !== "undefined") localStorage.setItem(EMP_KEY, t);
  empListeners.forEach((l) => l());
}

export function useEmployeeTheme(): ThemeName {
  return useSyncExternalStore(
    (cb) => {
      empListeners.add(cb);
      return () => empListeners.delete(cb);
    },
    readEmployeeTheme,
    () => "roxo"
  );
}

// ---------------- Theme tokens ----------------

type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  cardSecondary: string;
  border: string;
  muted: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
  secondary: string;
  secondaryFg: string;
  rose: string;       // primary accent
  roseLight: string;  // lighter accent
  roseDark: string;   // darker variant for hover/text
  gradient: string;
  soft: string;
  shadow: string;
  preview: string;
  ringPreview: string;
  label: string;
};

const THEMES: Record<ThemeName, ThemeTokens> = {
  roxo: {
    background: "oklch(0.18 0.10 305)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.30 0.11 305)",
    cardSecondary: "oklch(0.24 0.10 305)",
    border: "oklch(0.74 0.14 85 / 0.45)",
    muted: "oklch(0.26 0.09 305)",
    mutedFg: "oklch(0.80 0.06 290)",
    accent: "oklch(0.32 0.11 305)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.26 0.10 305)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.74 0.14 85)",
    roseLight: "oklch(0.86 0.15 90)",
    roseDark: "oklch(0.68 0.14 80)",
    gradient: "linear-gradient(135deg, oklch(0.74 0.14 85), oklch(0.86 0.15 90))",
    soft: "linear-gradient(135deg, oklch(0.18 0.10 305), oklch(0.30 0.11 305))",
    shadow: "0 10px 40px -10px oklch(0.74 0.14 85 / 0.55)",
    preview: "#1A0A2E",
    ringPreview: "#C9A227",
    label: "Roxo Dourado",
  },
  rose: {
    background: "oklch(0.18 0 0)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.28 0.005 0)",
    cardSecondary: "oklch(0.22 0.005 0)",
    border: "oklch(0.74 0.07 75 / 0.45)",
    muted: "oklch(0.24 0.005 0)",
    mutedFg: "oklch(0.78 0.04 60)",
    accent: "oklch(0.30 0.01 0)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.24 0.005 0)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.74 0.07 75)",
    roseLight: "oklch(0.86 0.08 80)",
    roseDark: "oklch(0.68 0.08 70)",
    gradient: "linear-gradient(135deg, oklch(0.74 0.07 75), oklch(0.86 0.08 80))",
    soft: "linear-gradient(135deg, oklch(0.18 0 0), oklch(0.28 0.005 0))",
    shadow: "0 10px 40px -10px oklch(0.74 0.07 75 / 0.5)",
    preview: "#1A1A1A",
    ringPreview: "#C9A96E",
    label: "Rose Gold",
  },
  esmeralda: {
    background: "oklch(0.20 0.05 145)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.30 0.06 145)",
    cardSecondary: "oklch(0.24 0.05 145)",
    border: "oklch(0.72 0.18 145 / 0.45)",
    muted: "oklch(0.26 0.05 145)",
    mutedFg: "oklch(0.82 0.07 145)",
    accent: "oklch(0.30 0.06 145)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.26 0.05 145)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.72 0.18 145)",
    roseLight: "oklch(0.85 0.15 145)",
    roseDark: "oklch(0.62 0.18 145)",
    gradient: "linear-gradient(135deg, oklch(0.72 0.18 145), oklch(0.85 0.15 145))",
    soft: "linear-gradient(135deg, oklch(0.20 0.05 145), oklch(0.30 0.06 145))",
    shadow: "0 10px 40px -10px oklch(0.72 0.18 145 / 0.55)",
    preview: "#0A1F0A",
    ringPreview: "#2ECC71",
    label: "Verde Esmeralda",
  },
  safira: {
    background: "oklch(0.18 0.08 270)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.30 0.10 270)",
    cardSecondary: "oklch(0.24 0.09 270)",
    border: "oklch(0.65 0.14 245 / 0.45)",
    muted: "oklch(0.26 0.08 270)",
    mutedFg: "oklch(0.82 0.08 250)",
    accent: "oklch(0.30 0.10 270)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.26 0.08 270)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.65 0.14 245)",
    roseLight: "oklch(0.82 0.10 240)",
    roseDark: "oklch(0.58 0.16 250)",
    gradient: "linear-gradient(135deg, oklch(0.65 0.14 245), oklch(0.82 0.10 240))",
    soft: "linear-gradient(135deg, oklch(0.18 0.08 270), oklch(0.30 0.10 270))",
    shadow: "0 10px 40px -10px oklch(0.65 0.14 245 / 0.55)",
    preview: "#0A0A2E",
    ringPreview: "#4A90D9",
    label: "Azul Safira",
  },
  pretoRose: {
    background: "oklch(0.13 0 0)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.24 0.005 0)",
    cardSecondary: "oklch(0.18 0.005 0)",
    border: "oklch(0.70 0.20 0 / 0.45)",
    muted: "oklch(0.20 0.005 0)",
    mutedFg: "oklch(0.78 0.04 350)",
    accent: "oklch(0.26 0.01 0)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.20 0.005 0)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.70 0.20 0)",
    roseLight: "oklch(0.85 0.10 350)",
    roseDark: "oklch(0.62 0.22 5)",
    gradient: "linear-gradient(135deg, oklch(0.70 0.20 0), oklch(0.85 0.10 350))",
    soft: "linear-gradient(135deg, oklch(0.13 0 0), oklch(0.24 0.005 0))",
    shadow: "0 10px 40px -10px oklch(0.70 0.20 0 / 0.55)",
    preview: "#0D0D0D",
    ringPreview: "#FF6B9D",
    label: "Preto Rosê",
  },
  bordo: {
    background: "oklch(0.18 0.06 25)",
    foreground: "oklch(0.99 0.005 60)",
    card: "oklch(0.30 0.07 25)",
    cardSecondary: "oklch(0.24 0.06 25)",
    border: "oklch(0.92 0.05 85 / 0.45)",
    muted: "oklch(0.26 0.06 25)",
    mutedFg: "oklch(0.85 0.04 70)",
    accent: "oklch(0.30 0.07 25)",
    accentFg: "oklch(0.99 0.005 60)",
    secondary: "oklch(0.26 0.06 25)",
    secondaryFg: "oklch(0.99 0.005 60)",
    rose: "oklch(0.92 0.05 85)",
    roseLight: "oklch(0.96 0.04 90)",
    roseDark: "oklch(0.85 0.06 80)",
    gradient: "linear-gradient(135deg, oklch(0.92 0.05 85), oklch(0.96 0.04 90))",
    soft: "linear-gradient(135deg, oklch(0.18 0.06 25), oklch(0.30 0.07 25))",
    shadow: "0 10px 40px -10px oklch(0.92 0.05 85 / 0.5)",
    preview: "#1A0A0A",
    ringPreview: "#F5E6C8",
    label: "Bordo Champagne",
  },
};

export function applyTheme(name: ThemeName) {
  if (typeof document === "undefined") return;
  const t = THEMES[name] ?? THEMES.roxo;
  const r = document.documentElement.style;
  r.setProperty("--background", t.background);
  r.setProperty("--foreground", t.foreground);
  r.setProperty("--card", t.card);
  r.setProperty("--card-foreground", t.foreground);
  r.setProperty("--popover", t.card);
  r.setProperty("--popover-foreground", t.foreground);
  r.setProperty("--primary", t.rose);
  r.setProperty("--primary-foreground", t.background);
  r.setProperty("--secondary", t.secondary);
  r.setProperty("--secondary-foreground", t.secondaryFg);
  r.setProperty("--muted", t.muted);
  r.setProperty("--muted-foreground", t.mutedFg);
  r.setProperty("--accent", t.accent);
  r.setProperty("--accent-foreground", t.accentFg);
  r.setProperty("--border", t.border);
  r.setProperty("--input", t.border);
  r.setProperty("--ring", t.rose);
  r.setProperty("--rose-gold", t.rose);
  r.setProperty("--rose-gold-light", t.roseLight);
  r.setProperty("--rose-gold-dark", t.roseDark);
  r.setProperty("--gradient-rose-gold", t.gradient);
  r.setProperty("--gradient-rose-soft", t.soft);
  r.setProperty("--shadow-rose", t.shadow);
  r.setProperty("--shadow-elegant", t.shadow);
}

export function useApplyTheme(themeName: ThemeName) {
  useEffect(() => {
    applyTheme(themeName);
  }, [themeName]);
}

export const THEME_OPTIONS: { value: ThemeName; label: string; preview: string; ring: string }[] =
  (Object.keys(THEMES) as ThemeName[]).map((k) => ({
    value: k,
    label: THEMES[k].label,
    preview: THEMES[k].preview,
    ring: THEMES[k].ringPreview,
  }));
