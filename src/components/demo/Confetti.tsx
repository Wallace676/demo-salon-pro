import { useEffect, useState } from "react";

const COLORS = ["#f5b8a0", "#e8a2b8", "#f3d3a3", "#c9a8d8", "#a8d8c8", "#ffd700"];

export function Confetti({ duration = 2500 }: { duration?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.8 + Math.random() * 1.2,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      rot: Math.random() * 360,
    }))
  );
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-fall ${p.dur}s ${p.delay}s linear forwards`,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
