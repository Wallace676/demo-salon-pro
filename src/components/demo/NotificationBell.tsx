import { useMemo, useState } from "react";
import { Bell, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useNotifications, markAllRead, removeNotification } from "@/lib/notifications";

export function NotificationBell() {
  const notifs = useNotifications();
  const unread = notifs.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);

  const handleAccept = (id: string) => {
    toast.success("Agendamento aceito ✅");
    removeNotification(id);
  };
  const handleDecline = (id: string) => {
    toast("Agendamento recusado");
    removeNotification(id);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open && unread > 0) markAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Notificações"
      >
        <Bell
          className="w-5 h-5"
          style={unread > 0 ? { color: "var(--rose-gold-dark)", animation: "pulse-soft 1.5s infinite" } : undefined}
        />
        {unread > 0 && (
          <span
            className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
            style={{ background: "oklch(0.55 0.22 25)", boxShadow: "0 0 0 2px var(--card)" }}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-card z-50 overflow-hidden"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="font-semibold text-sm">Notificações</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-accent">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifs.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">Sem notificações</div>
              )}
              {notifs.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">{n.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{n.body}</div>
                  {n.actions && n.actions.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {n.actions.includes("accept") && (
                        <button
                          onClick={() => handleAccept(n.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold text-white"
                          style={{ background: "var(--gradient-rose-gold)" }}
                        >
                          <Check className="w-3 h-3" /> Aceitar
                        </button>
                      )}
                      {n.actions.includes("decline") && (
                        <button
                          onClick={() => handleDecline(n.id)}
                          className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border border-border hover:bg-accent"
                        >
                          ❌ Recusar
                        </button>
                      )}
                      {n.actions.includes("view") && (
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border border-border hover:bg-accent"
                        >
                          Ver detalhes
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// helper hook to pre-compute noop, but allow tree-shake
export function useUnreadCount() {
  const notifs = useNotifications();
  return useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);
}
