import { Bell } from "lucide-react";
import { useLeads, markAllLeadsRead } from "@/lib/leadsStore";

export function LeadsBell({ onOpen }: { onOpen: () => void }) {
  const leads = useLeads();
  const unread = leads.filter((l) => !l.lido).length;

  return (
    <button
      onClick={() => {
        markAllLeadsRead();
        onOpen();
      }}
      className="relative p-2 rounded-full hover:bg-accent transition-colors"
      aria-label="Leads"
      title="Leads capturados"
    >
      <Bell
        className="w-5 h-5"
        style={unread > 0 ? { color: "var(--rose-gold-dark)", animation: "pulse-soft 1.5s infinite" } : { color: "var(--muted-foreground)" }}
      />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
          style={{ background: "oklch(0.55 0.22 25)", boxShadow: "0 0 0 2px var(--card)" }}
        >
          {unread}
        </span>
      )}
    </button>
  );
}
