export type InactiveStatus = "afastada" | "sumida" | "perdida";

export type InactiveClient = {
  name: string;
  lastService: string;
  professional: string;
  daysSinceLast: number;
  totalVisits: number;
  averageReturnDays: number;
};

export const INACTIVE_CLIENTS: InactiveClient[] = [
  { name: "Ana Silva", lastService: "Coloração", professional: "Carla", daysSinceLast: 95, totalVisits: 12, averageReturnDays: 28 },
  { name: "Beatriz Souza", lastService: "Hidratação", professional: "Juliana", daysSinceLast: 65, totalVisits: 7, averageReturnDays: 30 },
  { name: "Renata Ferreira", lastService: "Manicure", professional: "Carla", daysSinceLast: 45, totalVisits: 9, averageReturnDays: 21 },
  { name: "Larissa Mendes", lastService: "Escova Progressiva", professional: "Juliana", daysSinceLast: 72, totalVisits: 5, averageReturnDays: 35 },
  { name: "Gabriela Alves", lastService: "Sobrancelha Design", professional: "Patricia", daysSinceLast: 38, totalVisits: 14, averageReturnDays: 22 },
];

export function statusFor(days: number): { status: InactiveStatus; label: string; emoji: string; color: string; bg: string } {
  if (days >= 90)
    return { status: "perdida", label: "Perdida", emoji: "🔴", color: "oklch(0.45 0.20 25)", bg: "oklch(0.96 0.07 25)" };
  if (days >= 60)
    return { status: "sumida", label: "Sumida", emoji: "🟠", color: "oklch(0.50 0.17 50)", bg: "oklch(0.97 0.07 60)" };
  return { status: "afastada", label: "Afastada", emoji: "🟡", color: "oklch(0.45 0.15 80)", bg: "oklch(0.97 0.08 90)" };
}
