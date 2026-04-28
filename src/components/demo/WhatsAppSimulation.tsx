import { useEffect, useState } from "react";

type Msg = { from: "client" | "bot"; text: string; typing?: boolean };

const SCRIPT: Msg[] = [
  { from: "client", text: "Oi" },
  { from: "bot", text: "Olá! 👋 Bem-vinda ao Salão Bella! Como posso te ajudar?\n\n1️⃣ Agendar horário\n2️⃣ Ver serviços\n3️⃣ Falar com atendente" },
  { from: "client", text: "1" },
  { from: "bot", text: "Ótimo! Qual seu nome? 😊" },
  { from: "client", text: "Ana Silva" },
  { from: "bot", text: "Prazer, Ana! Qual serviço você gostaria?\n\n• Corte Feminino — R$80\n• Escova Progressiva — R$220\n• Coloração — R$180" },
  { from: "client", text: "Corte Feminino" },
  { from: "bot", text: "Perfeito! Tenho estes horários amanhã:\n\n🕒 10:00\n🕒 14:30\n🕒 16:00" },
  { from: "client", text: "14:30" },
  { from: "bot", text: "✅ Agendado!\n\n📅 Amanhã às 14:30\n💇 Corte Feminino\n💰 R$80\n\nTe espero! 💕" },
];

export function WhatsAppSimulation() {
  const [visible, setVisible] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeouts: ReturnType<typeof setTimeout>[] = [];

    const run = async () => {
      while (!cancelled) {
        setVisible([]);
        for (const m of SCRIPT) {
          if (cancelled) return;
          if (m.from === "bot") {
            setTyping(true);
            await new Promise((r) => timeouts.push(setTimeout(r, 1100)));
            if (cancelled) return;
            setTyping(false);
          } else {
            await new Promise((r) => timeouts.push(setTimeout(r, 700)));
          }
          setVisible((v) => [...v, m]);
          await new Promise((r) => timeouts.push(setTimeout(r, 600)));
        }
        await new Promise((r) => timeouts.push(setTimeout(r, 3000)));
      }
    };
    run();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="max-w-sm mx-auto bg-[#e5ddd5] rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: "var(--whatsapp)" }}>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">B</div>
        <div className="text-white">
          <div className="font-semibold text-sm">Bot Salão Bella</div>
          <div className="text-xs opacity-80">online</div>
        </div>
      </div>
      <div
        className="h-[440px] overflow-y-auto px-3 py-4 space-y-2"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(0.95 0.03 90 / 0.5) 0, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.92 0.04 80 / 0.5) 0, transparent 50%)",
        }}
      >
        {visible.map((m, idx) => (
          <div key={idx} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div
              className={`max-w-[78%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                m.from === "client" ? "rounded-br-sm" : "rounded-bl-sm bg-white"
              }`}
              style={m.from === "client" ? { background: "#dcf8c6" } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white rounded-lg rounded-bl-sm px-3 py-2.5 flex gap-1">
              <Dot delay="0s" />
              <Dot delay="0.15s" />
              <Dot delay="0.3s" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block"
      style={{ animation: `typing-dot 1.2s infinite ${delay}` }}
    />
  );
}
