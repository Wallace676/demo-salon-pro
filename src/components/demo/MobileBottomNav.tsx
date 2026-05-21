import { Home, Calendar, Users, Scissors, MessageCircle, Users2, BarChart3, Target, TrendingUp, Settings as SettingsIcon, DollarSign, CalendarDays, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MobileTabKey =
  | "dashboard" | "appointments" | "clients" | "services" | "bot"
  | "team" | "performance" | "leads" | "reports" | "settings"
  | "commissions" | "teamSchedule";

type Item = { key: MobileTabKey; label: string; icon: LucideIcon };

const OWNER_TABS: Item[] = [
  { key: "dashboard",    label: "Início",     icon: LayoutDashboard },
  { key: "appointments", label: "Agenda",     icon: Calendar },
  { key: "clients",      label: "Clientes",   icon: Users },
  { key: "bot",          label: "Bot",        icon: MessageCircle },
  { key: "settings",     label: "Mais",       icon: SettingsIcon },
];

const EMPLOYEE_TABS: Item[] = [
  { key: "dashboard",    label: "Início",     icon: Home },
  { key: "appointments", label: "Agenda",     icon: Calendar },
  { key: "teamSchedule", label: "Equipe",     icon: CalendarDays },
  { key: "clients",      label: "Clientes",   icon: Users },
  { key: "commissions",  label: "Comissões",  icon: DollarSign },
];

// Icons we re-export so we don't bring extras unused
void Scissors; void Users2; void BarChart3; void Target; void TrendingUp;

export function MobileBottomNav({
  active,
  onChange,
  isEmployee,
}: {
  active: MobileTabKey;
  onChange: (k: MobileTabKey) => void;
  isEmployee: boolean;
}) {
  const items = isEmployee ? EMPLOYEE_TABS : OWNER_TABS;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav safe-bottom"
      aria-label="Navegação principal"
    >
      <ul className="grid grid-cols-5 px-1 pt-1.5">
        {items.map((it) => {
          const isActive = active === it.key;
          const Icon = it.icon;
          return (
            <li key={it.key}>
              <button
                onClick={() => onChange(it.key)}
                className="tap-scale w-full flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl relative"
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{ background: "var(--gradient-rose-gold)" }}
                  />
                )}
                <Icon
                  className="w-5 h-5 transition-transform"
                  style={{
                    color: isActive ? "var(--rose-gold-dark)" : "var(--muted-foreground)",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <span
                  className="text-[10px] font-medium leading-none"
                  style={{ color: isActive ? "var(--rose-gold-dark)" : "var(--muted-foreground)" }}
                >
                  {it.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
