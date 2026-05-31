import { Circle, CheckCircle2 } from "lucide-react";

export function Legend() {
  const items = [
    { icon: <Circle size={14} className="text-ink-faint" />, label: "Not started", color: "text-ink-dim" },
    { icon: <Circle size={14} className="text-cyan-300 fill-cyan-500/30" />, label: "In progress", color: "text-cyan-200" },
    { icon: <CheckCircle2 size={14} className="text-emerald-300" />, label: "Mastered", color: "text-emerald-200" },
  ];
  return (
    <div className="panel-soft rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
      {items.map((it) => (
        <div key={it.label} className={`flex items-center gap-2 ${it.color}`}>
          {it.icon}
          <span className="font-medium">{it.label}</span>
        </div>
      ))}
      <span className="ml-auto text-[11px] text-ink-faint">Everything is clickable — no gates.</span>
    </div>
  );
}
