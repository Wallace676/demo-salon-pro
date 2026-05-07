import { useEffect, useRef, useState } from "react";

type Msg = { from: "client" | "bot"; text: string };

const CONVERSATIONS: Msg[][] = [
  [
    { from: "client", text: "oi" },
    { from: "bot", text: "Oi! 💅 Bem-vinda ao Salão Bella! Como posso te ajudar hoje? 😊\n\n1️⃣ Agendar horário\n2️⃣ Ver serviços e preços\n3️⃣ Falar com atendente" },
    { from: "client", text: "sonbracela" },
    { from: "bot", text: "Sobrancelha design! ✨ Ótima escolha! Custa R$35 e fica prontinha em 20 minutinhos 💛\n\nQue dia você quer vir, amor?" },
    { from: "client", text: "pode ser amanha de manha?" },
    { from: "bot", text: "Amanhã de manhã tenho horário às 9h ou 10h30 ☀️ Qual prefere?" },
    { from: "client", text: "9" },
    { from: "bot", text: "Perfeito! ✅ Agendado!\n\n📅 Amanhã às 9h\n💅 Sobrancelha Design\n📍 Salão Bella\n\nTe mando lembrete 1h antes 😉" },
  ],
  [
    { from: "client", text: "mana tô querendo dar um trato no cabelo" },
    { from: "bot", text: "Aaaah vamos deixar o cabelo lindo! 💇‍♀️✨ Temos:\n\n• Corte Feminino — R$80\n• Hidratação Capilar — R$120\n• Progressiva — R$220\n\nO que tá precisando, amor?" },
    { from: "client", text: "quanto ta a progressiva" },
    { from: "bot", text: "A progressiva tá R$220 💛 Leva umas 2 horinhas e o resultado é INCRÍVEL! 😍\n\nQuer agendar?" },
    { from: "client", text: "fecha pra mim" },
    { from: "bot", text: "Fechou! 🎉 Me fala seu nome pra eu confirmar tudo certinho?" },
  ],
  [
    { from: "client", text: "preciso cancelar meu horário" },
    { from: "bot", text: "Oi! Que pena 😢 Qual é seu nome pra eu encontrar seu agendamento?" },
    { from: "client", text: "ana" },
    { from: "bot", text: "Encontrei! Ana Silva, amanhã às 14h — Coloração 🎨\n\nConfirma o cancelamento?" },
    { from: "client", text: "sim obrigada" },
    { from: "bot", text: "Cancelado! 💛 Quando quiser remarcar é só me chamar aqui.\n\nVai sentir minha falta? 😂" },
  ],
  [
    { from: "client", text: "Oi" },
    { from: "bot", text: "Oi Ana! Que saudade! 🥰\n\nFaz 23 dias desde sua última visita com a Carla!\n\nComo posso te ajudar?\n\n1️⃣ Agendar horário\n2️⃣ Ver serviços e preços\n3️⃣ Falar com atendente" },
    { from: "client", text: "1" },
    { from: "bot", text: "Vi aqui que você costuma vir com a Carla 💛\n\nQuer agendar com ela novamente?" },
    { from: "client", text: "sim" },
    { from: "bot", text: "Ótimo! A Carla tem esses horários disponíveis:\n\n📅 Amanhã — 14h ou 16h\n📅 Sexta — 10h ou 14h30\n\nQual prefere?" },
    { from: "client", text: "amanhã 14h" },
    { from: "bot", text: "Qual serviço você gostaria de fazer?\n\n💅 Manicure — R$45\n🦶 Pedicure — R$55\n✨ Sobrancelha — R$35\n💇 Corte — R$80" },
    { from: "client", text: "manicure" },
    { from: "bot", text: "Perfeito! ✅\n\n📅 Amanhã às 14h\n💅 Manicure com Carla\n💰 R$45\n\nConfirma o agendamento?" },
    { from: "client", text: "sim" },
    { from: "bot", text: "Agendado com sucesso! 🎉\n\nTe mando um lembrete 1 hora antes, tá bom?\n\nQualquer coisa é só me chamar 💛" },
  ],
  [
    { from: "client", text: "oi posso fazer mani amanhã?" },
    { from: "bot", text: "Oi! 💅 Claro! Vou checar a agenda real de cada profissional...\n\nA Carla tem horário às:\n📅 14h25 (após manicure terminar)\n📅 16h00\n\nQual prefere?" },
    { from: "client", text: "14h25" },
    { from: "bot", text: "Perfeito! ✅ Carla faz sua manicure em 25min.\n\n📅 Amanhã às 14h25\n💅 Manicure com Carla — R$45\n\nConfirma?" },
    { from: "client", text: "sim" },
    { from: "bot", text: "Agendado! 🎉 Te mando lembrete 1h antes 💛" },
  ],
];

export function MariSimulation() {
  const [convIdx, setConvIdx] = useState(0);
  const [visible, setVisible] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timeouts.push(setTimeout(() => r(), ms)));

    const run = async () => {
      const script = CONVERSATIONS[convIdx];
      setVisible([]);
      await wait(400);
      for (const m of script) {
        if (cancelled) return;
        if (m.from === "bot") {
          setTyping(true);
          await wait(1300);
          if (cancelled) return;
          setTyping(false);
        } else {
          await wait(700);
        }
        setVisible((v) => [...v, m]);
        await wait(900);
      }
      await wait(3500);
      if (!cancelled) setConvIdx((i) => (i + 1) % CONVERSATIONS.length);
    };
    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [convIdx]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible, typing]);

  return (
    <div className="max-w-sm mx-auto bg-[#e5ddd5] rounded-2xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: "var(--whatsapp)" }}>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">M</div>
        <div className="text-white flex-1">
          <div className="font-semibold text-sm">Mari 💅</div>
          <div className="text-xs opacity-80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            online
          </div>
        </div>
      </div>
      {convIdx === 3 && (
        <div className="px-3 py-2 text-[11px] font-medium text-center" style={{ background: "oklch(0.97 0.025 25)", color: "var(--rose-gold-dark)" }}>
          🔄 Cliente recorrente — bot reconhece e sugere profissional preferida
        </div>
      )}
      {convIdx === 4 && (
        <div className="px-3 py-2 text-[11px] font-medium text-center" style={{ background: "oklch(0.97 0.025 25)", color: "var(--rose-gold-dark)" }}>
          ⏱️ Bot calcula horários reais por duração de cada profissional
        </div>
      )}
      <div
        ref={scrollRef}
        className="h-[420px] overflow-y-auto px-3 py-4 space-y-2"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, oklch(0.95 0.03 90 / 0.5) 0, transparent 50%), radial-gradient(circle at 80% 80%, oklch(0.92 0.04 80 / 0.5) 0, transparent 50%)",
        }}
      >
        {visible.map((m, idx) => (
          <div key={idx} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line shadow-sm ${
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
