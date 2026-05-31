"use client";
import { Headphones } from "lucide-react";
import { PODCASTS } from "@/lib/podcasts";

/**
 * Source filter chip row. With one podcast it renders as a static label.
 * When you add another podcast to PODCASTS, this auto-expands to a multi-select.
 */
export function PodcastFilter({
  selected, onChange,
}: {
  selected: "all" | string;
  onChange: (next: "all" | string) => void;
}) {
  const multiSource = PODCASTS.length > 1;

  if (!multiSource) {
    const only = PODCASTS[0];
    return (
      <div className="inline-flex items-center gap-2 panel-soft rounded-full px-3 py-1 text-[11px]">
        <Headphones size={12} className="text-cyan-300" />
        <span className="text-ink-dim">Source</span>
        <span
          className="font-semibold"
          style={{ color: only.color, textShadow: `0 0 6px ${only.color}55` }}
        >
          {only.shortName}
        </span>
      </div>
    );
  }

  const chip = (id: "all" | string, label: string, color?: string) => {
    const active = selected === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onChange(id)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors
          ${active ? "bg-white/10 text-ink border-white/30" : "panel-soft text-ink-dim border-transparent hover:text-ink"}
        `}
        style={active && color ? { boxShadow: `0 0 14px ${color}33`, borderColor: `${color}80` } : undefined}
      >
        {color && (
          <span className="size-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        )}
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim mr-1">Source</div>
      {chip("all", `All (${PODCASTS.length})`)}
      {PODCASTS.map((p) => chip(p.id, p.shortName, p.color))}
    </div>
  );
}
