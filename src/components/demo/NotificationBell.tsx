import { useMemo, useState } from "react";
import { Bell, X, Check, CheckCheck, Trash2, Volume2, VolumeX, AlertCircle, Info, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  useNotifications,
  markAllRead,
  markRead,
  removeNotification,
  clearAll,
  isSoundEnabled,
  setSoundEnabled,
  type Notification,
  type NotificationKind,
} from "@/lib/notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const KIND_META: Record<NotificationKind, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  success:  { label: "Sucesso",  color: "oklch(0.62 0.16 145)", icon: Check },
  error:    { label: "Erro",     color: "oklch(0.58 0.22 25)",  icon: AlertCircle },
  lembrete: { label: "Lembrete", color: "oklch(0.65 0.15 60)",  icon: Clock },
  sistema:  { label: "Sistema",  color: "oklch(0.55 0.05 280)", icon: Info },
};

type Filter = "all" | NotificationKind;

function timeAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export function NotificationBell() {
  const notifs = useNotifications();
  const unread = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [soundOn, setSoundOnState] = useState<boolean>(() => isSoundEnabled());

  const list = useMemo(
    () => (filter === "all" ? notifs : notifs.filter((n) => n.kind === filter)),
    [notifs, filter],
  );

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOnState(next);
    toast(next ? "🔔 Sons ativados" : "🔕 Sons silenciados");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && unread > 0) markAllRead();
      }}
    >
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-full hover:bg-accent transition-colors"
          aria-label={`Notificações${unread > 0 ? ` (${unread} novas)` : ""}`}
        >
          <Bell
            className="w-5 h-5"
            style={unread > 0 ? { color: "var(--rose-gold-dark)", animation: "pulse-soft 1.5s infinite" } : undefined}
          />
          {unread > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-scale-in"
              style={{
                background: "var(--gradient-rose-gold)",
                boxShadow: "0 0 0 2px var(--card), var(--shadow-rose)",
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0 overflow-hidden rounded-xl border-border"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div
          className="px-4 py-3 border-b border-border flex items-center justify-between"
          style={{ background: "linear-gradient(180deg, rgba(255,182,193,0.10), transparent)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ background: "var(--gradient-rose-gold)" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm text-foreground">Notificações</div>
              <div className="text-[10px] text-muted-foreground">
                {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Tudo em dia ✨"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
              aria-label={soundOn ? "Desativar sons" : "Ativar sons"}
              title={soundOn ? "Desativar sons" : "Ativar sons"}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-md hover:bg-accent"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="w-full">
          <div className="px-2 pt-2">
            <TabsList className="w-full grid grid-cols-5 h-8">
              <TabsTrigger value="all" className="text-[10px] px-1">Todas</TabsTrigger>
              <TabsTrigger value="success" className="text-[10px] px-1">✅</TabsTrigger>
              <TabsTrigger value="error" className="text-[10px] px-1">⚠️</TabsTrigger>
              <TabsTrigger value="lembrete" className="text-[10px] px-1">⏰</TabsTrigger>
              <TabsTrigger value="sistema" className="text-[10px] px-1">⚙️</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="m-0">
            <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-border">
              {list.length === 0 && (
                <div className="px-4 py-10 text-center text-xs text-muted-foreground">
                  Nenhuma notificação aqui ainda
                </div>
              )}
              {list.map((n) => (
                <NotifRow key={n.id} n={n} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {notifs.length > 0 && (
          <div className="px-3 py-2 border-t border-border flex items-center justify-between gap-2 bg-card">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="w-3 h-3" /> Marcar todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive"
              onClick={() => {
                clearAll();
                toast("Central de notificações limpa");
              }}
            >
              <Trash2 className="w-3 h-3" /> Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotifRow({ n }: { n: Notification }) {
  const meta = KIND_META[n.kind] ?? KIND_META.sistema;
  const Icon = meta.icon;

  const handleAccept = () => {
    toast.success("Agendamento aceito ✅");
    removeNotification(n.id);
  };
  const handleDecline = () => {
    toast("Agendamento recusado");
    removeNotification(n.id);
  };

  return (
    <div
      className={`px-4 py-3 transition-colors animate-fade-in ${n.read ? "" : "bg-accent/40"}`}
      onMouseEnter={() => !n.read && markRead(n.id)}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: meta.color }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-foreground truncate">{n.title}</div>
            {!n.read && (
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "var(--rose-gold-dark)" }}
              />
            )}
          </div>
          {n.body && (
            <div className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{n.body}</div>
          )}
          <div className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</div>

          {n.actions && n.actions.length > 0 && (
            <div className="flex gap-2 mt-2">
              {n.actions.includes("accept") && (
                <button
                  onClick={handleAccept}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-semibold text-white"
                  style={{ background: "var(--gradient-rose-gold)" }}
                >
                  <Check className="w-3 h-3" /> Aceitar
                </button>
              )}
              {n.actions.includes("decline") && (
                <button
                  onClick={handleDecline}
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
        <button
          onClick={() => removeNotification(n.id)}
          className="p-1 rounded hover:bg-accent text-muted-foreground"
          aria-label="Remover"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function useUnreadCount() {
  const notifs = useNotifications();
  return useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);
}
