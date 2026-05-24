import { Appointment, servicesStore, appointmentsStore } from "./demoStore";
import { getDurationFor } from "./employeeDurations";
import { TEAM } from "./demoProfessionals";

export const DEFAULT_DURATION = 30;
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 20;
export const SLOT_STEP = 30; // minutes

/** "HH:MM" → minutes from 00:00. Returns NaN-safe 0 on bad input. */
export function timeToMin(t?: string | null): number {
  if (!t || typeof t !== "string") return 0;
  const [h, m] = t.split(":").map((x) => parseInt(x, 10));
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

export function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Resolve the duration to use for an appointment given service + optional pro. */
export function resolveDuration(opts: {
  service?: string;
  professional?: string;
  explicit?: number;
}): number {
  if (opts.explicit && opts.explicit > 0) return opts.explicit;
  const svc = (servicesStore.get() || []).find((s) => s?.name === opts.service);
  const baseFromService = svc?.duration && svc.duration > 0 ? svc.duration : DEFAULT_DURATION;
  if (opts.professional) {
    const empId = TEAM.find((t) => t.name === opts.professional)?.id;
    if (empId && opts.service) {
      return getDurationFor(empId, opts.service, baseFromService);
    }
  }
  return baseFromService;
}

/** Active appointments only — cancelled ones free the slot. */
export function activeAppointments(list?: Appointment[] | null): Appointment[] {
  const src = list ?? appointmentsStore.get() ?? [];
  return src.filter((a) => a && a.status !== "cancelado");
}

/** Generate all candidate HH:MM slots for the working day. */
export function dayTimeSlots(): string[] {
  const out: string[] = [];
  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < CLOSE_HOUR) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

export type Conflict = {
  type: "professional" | "client";
  with: Appointment;
};

/** Returns first conflicting appointment (same date, overlap, same professional or same client) */
export function findConflict(
  candidate: {
    id?: string;
    date: string;
    time: string;
    duration: number;
    professional?: string;
    clientName?: string;
  },
  list?: Appointment[] | null,
): Conflict | null {
  if (!candidate?.date || !candidate?.time) return null;
  const start = timeToMin(candidate.time);
  const end = start + Math.max(1, candidate.duration || DEFAULT_DURATION);
  const all = activeAppointments(list);
  for (const a of all) {
    if (!a || a.id === candidate.id) continue;
    if (a.date !== candidate.date) continue;
    const aStart = timeToMin(a.time);
    const aDur = resolveDuration({
      service: a.service,
      professional: a.professional,
      explicit: a.duration,
    });
    const aEnd = aStart + aDur;
    const overlaps = start < aEnd && end > aStart;
    if (!overlaps) continue;
    if (candidate.professional && a.professional && a.professional === candidate.professional) {
      return { type: "professional", with: a };
    }
    if (
      candidate.clientName &&
      a.clientName &&
      a.clientName.trim().toLowerCase() === candidate.clientName.trim().toLowerCase()
    ) {
      return { type: "client", with: a };
    }
  }
  return null;
}

/** For a given date + professional + duration, return which slots are unavailable. */
export function unavailableSlots(opts: {
  date: string;
  professional?: string;
  duration: number;
  excludeId?: string;
  list?: Appointment[] | null;
}): Set<string> {
  const out = new Set<string>();
  if (!opts.date) return out;
  const slots = dayTimeSlots();
  for (const t of slots) {
    const c = findConflict(
      {
        id: opts.excludeId,
        date: opts.date,
        time: t,
        duration: opts.duration,
        professional: opts.professional,
      },
      opts.list,
    );
    if (c) out.add(t);
    // also block if slot end goes past closing
    if (timeToMin(t) + opts.duration > CLOSE_HOUR * 60) out.add(t);
  }
  return out;
}

export function validateAppointment(candidate: {
  id?: string;
  clientName: string;
  phone?: string;
  service: string;
  date: string;
  time: string;
  duration?: number;
  professional?: string;
}): { ok: true } | { ok: false; reason: string } {
  if (!candidate.clientName?.trim()) return { ok: false, reason: "Informe o nome do cliente." };
  if (!candidate.service) return { ok: false, reason: "Selecione um serviço." };
  if (!candidate.date) return { ok: false, reason: "Selecione uma data." };
  if (!candidate.time) return { ok: false, reason: "Selecione um horário." };
  const dur = resolveDuration({
    service: candidate.service,
    professional: candidate.professional,
    explicit: candidate.duration,
  });
  if (timeToMin(candidate.time) + dur > CLOSE_HOUR * 60) {
    return { ok: false, reason: `O serviço (${dur}min) ultrapassa o horário de funcionamento.` };
  }
  const conflict = findConflict({
    id: candidate.id,
    date: candidate.date,
    time: candidate.time,
    duration: dur,
    professional: candidate.professional,
    clientName: candidate.clientName,
  });
  if (conflict) {
    if (conflict.type === "professional") {
      return {
        ok: false,
        reason: `${candidate.professional} já tem ${conflict.with.clientName} às ${conflict.with.time}.`,
      };
    }
    return {
      ok: false,
      reason: `${candidate.clientName} já tem um agendamento neste horário (${conflict.with.service} às ${conflict.with.time}).`,
    };
  }
  return { ok: true };
}
