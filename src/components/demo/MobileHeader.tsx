import { Sparkles, ChevronLeft } from "lucide-react";
import { NotificationBell } from "@/components/demo/NotificationBell";
import { LeadsBell } from "@/components/demo/LeadsBell";
import { useSettings } from "@/lib/demoSettings";

export function MobileHeader({
  title,
  onBack,
  isEmployee,
  onOpenLeads,
}: {
  title: string;
  onBack: () => void;
  isEmployee: boolean;
  onOpenLeads: () => void;
}) {
  const s = useSettings();
  return (
    <header className="md:hidden sticky top-0 z-30 glass-header safe-top">
      <div className="flex items-center gap-2 px-3 h-12">
        <button
          onClick={onBack}
          className="tap-scale -ml-1 p-2 rounded-full text-foreground"
          aria-label="Voltar ao início"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {s.logoDataUrl ? (
          <img src={s.logoDataUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-rose-gold)" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        )}

        <h1 className="flex-1 font-semibold text-sm text-foreground truncate">{title}</h1>

        <NotificationBell />
        {!isEmployee && <LeadsBell onOpen={onOpenLeads} />}
      </div>
    </header>
  );
}
