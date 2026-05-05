import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEME_OPTIONS, useEmployeeTheme, setEmployeeTheme, type ThemeName } from "@/lib/demoSettings";
import { toast } from "sonner";

export function EmployeeThemePicker() {
  const current = useEmployeeTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Tema pessoal"
        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={{ background: "var(--gradient-rose-gold)", color: "white", boxShadow: "var(--shadow-rose)" }}
      >
        <Palette className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-xl p-4 z-50 animate-fade-in"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-elegant)",
          }}
        >
          <div className="font-semibold text-foreground mb-1">Seu tema pessoal</div>
          <p className="text-xs text-muted-foreground mb-3">
            Só você verá essa cor. Não afeta o sistema da dona.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((t) => {
              const selected = current === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setEmployeeTheme(t.value as ThemeName);
                    toast.success("Tema pessoal salvo! 🎨");
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="relative rounded-full"
                    style={{
                      width: selected ? 44 : 40,
                      height: selected ? 44 : 40,
                      background: t.preview,
                      border: `3px solid ${t.ring}`,
                      boxShadow: selected ? `0 0 14px ${t.ring}` : undefined,
                    }}
                  >
                    {selected && (
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: t.ring, color: t.preview }}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-foreground text-center leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
