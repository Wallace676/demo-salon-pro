import { getEmployeesForService } from "./employeeSpecialties";

export const TEAM = [
  { id: "carla", name: "Carla", color: "oklch(0.78 0.12 25)" },
  { id: "juliana", name: "Juliana", color: "oklch(0.75 0.13 305)" },
  { id: "patricia", name: "Patricia", color: "oklch(0.75 0.13 165)" },
  { id: "renata", name: "Renata", color: "oklch(0.75 0.13 250)" },
  { id: "gabriela", name: "Gabriela", color: "oklch(0.78 0.13 60)" },
];

export function teamColor(name: string): string {
  return TEAM.find((t) => t.name === name)?.color || "oklch(0.78 0.10 30)";
}

function hashToIdx(input: string, mod: number) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function professionalForAppointment(apptId: string, service: string): string {
  const eligible = getEmployeesForService(service, TEAM);
  const pool = eligible.length > 0 ? eligible : TEAM;
  return pool[hashToIdx(apptId + service, pool.length)].name;
}

export function eligibleProfessionals(service: string) {
  const eligible = getEmployeesForService(service, TEAM);
  return eligible.length > 0 ? eligible : TEAM;
}
