import { useSyncExternalStore } from "react";
import { toast } from "sonner";

export type NotificationKind = "success" | "error" | "lembrete" | "sistema";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  createdAt: number;
  read: boolean;
  actions?: ("accept" | "decline" | "view")[];
  /** legacy field — kept for backward compatibility */
  type?: string;
};

const KEY = "demo_employee_notifs_v2";
const SOUND_KEY = "demo_notif_sound_v1";
const listeners = new Set<() => void>();
let cache: Notification[] | null = null;

const SEED: Notification[] = [
  {
    id: "n1",
    kind: "lembrete",
    title: "📅 Novo agendamento adicionado",
    body: "Beatriz Souza — amanhã 10h • Manicure",
    createdAt: Date.now() - 1000 * 60 * 5,
    read: false,
    actions: ["view"],
  },
];

function read(): Notification[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Notification[];
      // migrate v1 entries that used `type` + `time`
      cache = parsed.map((n) => ({
        ...n,
        kind: n.kind ?? legacyToKind(n.type),
        createdAt: n.createdAt ?? Date.now(),
      }));
    } else {
      cache = SEED;
      localStorage.setItem(KEY, JSON.stringify(SEED));
    }
  } catch {
    cache = SEED;
  }
  return cache!;
}

function legacyToKind(type?: string): NotificationKind {
  if (type === "new_appointment") return "lembrete";
  if (type === "transfer") return "sistema";
  return "sistema";
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
    () => SEED,
  );
}

export type AddNotificationInput =
  | (Omit<Notification, "id" | "createdAt" | "read" | "kind"> & { kind: NotificationKind })
  // legacy signature
  | (Omit<Notification, "id" | "createdAt" | "read" | "kind"> & { type: string });

export function addNotification(n: AddNotificationInput) {
  const kind: NotificationKind = "kind" in n ? n.kind : legacyToKind((n as { type: string }).type);
  const next: Notification = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    read: false,
    kind,
    title: n.title,
    body: n.body,
    actions: n.actions,
    type: "type" in n ? n.type : undefined,
  };
  write([next, ...read()]);
  playSoundFor(kind);
  return next;
}

export function markAllRead() {
  write(read().map((n) => ({ ...n, read: true })));
}

export function markRead(id: string) {
  write(read().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function removeNotification(id: string) {
  write(read().filter((n) => n.id !== id));
}

export function clearAll() {
  write([]);
}

/* -------------------- combined notify (toast + center) -------------------- */

type NotifyOptions = {
  kind: NotificationKind;
  title: string;
  body?: string;
  duration?: number;
  actions?: ("accept" | "decline" | "view")[];
  silent?: boolean;
};

export function notify(opts: NotifyOptions) {
  const { kind, title, body, duration = 4000, actions, silent } = opts;
  const stored = silent
    ? null
    : addNotification({ kind, title, body, actions });

  const toastFn =
    kind === "success" ? toast.success
    : kind === "error" ? toast.error
    : kind === "lembrete" ? toast.message
    : toast;

  toastFn(title, { description: body, duration });
  return stored;
}

/* -------------------- sound -------------------- */

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SOUND_KEY) !== "0";
}

export function setSoundEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  listeners.forEach((l) => l());
}

function playSoundFor(kind: NotificationKind) {
  if (typeof window === "undefined") return;
  if (!isSoundEnabled()) return;
  try {
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const freq =
      kind === "success" ? 880 :
      kind === "error" ? 220 :
      kind === "lembrete" ? 660 : 520;
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.36);
    o.onended = () => ctx.close();
  } catch {
    /* ignore */
  }
}
