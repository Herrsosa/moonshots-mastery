"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { buildConceptStats, type ConceptStat } from "@/lib/concepts";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS, MISSION_BY_ID } from "@/content/missions";

const STATE_STYLES: Record<ConceptStat["state"], { bg: string; border: string; text: string; dot: string }> = {
  mastered:    { bg: "bg-emerald-500/15",  border: "border-emerald-400/40", text: "text-emerald-100", dot: "#22C55E" },
  in_progress: { bg: "bg-cyan-500/15",     border: "border-cyan-400/40",    text: "text-cyan-100",    dot: "#22D3EE" },
  weak:        { bg: "bg-amber-500/15",    border: "border-amber-400/40",   text: "text-amber-100",   dot: "#F59E0B" },
  untouched:   { bg: "bg-white/[0.04]",    border: "border-white/10",       text: "text-ink-dim",     dot: "#52525B" },
};

const STATE_LABEL: Record<ConceptStat["state"], string> = {
  mastered: "Mastered",
  in_progress: "In progress",
  weak: "Weak area",
  untouched: "Untouched",
};

export function ConceptCloud({ limit = 16 }: { limit?: number }) {
  const missions = useStore((s) => s.missions);
  const stats = useMemo(() => buildConceptStats(ALL_MISSIONS, missions), [missions]);
  const [active, setActive] = useState<ConceptStat | null>(null);

  // Take the top N by occurrence so the cloud reads as cross-cutting ideas first
  const top = stats.slice(0, limit);

  // Font-size scale: 1-occurrence = 11px, 3+ = 14px
  const sizeFor = (n: number) => 10 + Math.min(4, n) * 1.2;

  // Counts for the legend strip
  const counts = useMemo(
    () => ({
      mastered: stats.filter((c) => c.state === "mastered").length,
      in_progress: stats.filter((c) => c.state === "in_progress").length,
      weak: stats.filter((c) => c.state === "weak").length,
      untouched: stats.filter((c) => c.state === "untouched").length,
    }),
    [stats]
  );

  return (
    <div className="panel rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={14} className="text-purple-300" />
        <div className="text-[11px] uppercase tracking-[0.2em] text-purple-300/80 font-semibold">Concept constellation</div>
      </div>
      <p className="text-[12px] text-ink-dim mb-3">
        Concepts cross episodes — click one to jump to the missions that teach it.
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] mb-4">
        <LegendChip color="#22C55E" label={`Mastered ${counts.mastered}`} />
        <LegendChip color="#22D3EE" label={`In progress ${counts.in_progress}`} />
        <LegendChip color="#F59E0B" label={`Weak ${counts.weak}`} />
        <LegendChip color="#52525B" label={`Untouched ${counts.untouched}`} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {top.map((c) => {
          const s = STATE_STYLES[c.state];
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => setActive(c)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-colors ${s.bg} ${s.border} ${s.text} hover:bg-white/10`}
              style={{ fontSize: sizeFor(c.occurrences) }}
            >
              <span className="size-1.5 rounded-full" style={{ background: s.dot, boxShadow: `0 0 8px ${s.dot}` }} />
              {c.label}
              {c.occurrences > 1 && (
                <span className="text-[9px] opacity-70 font-mono">×{c.occurrences}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 bg-bg-base/80 backdrop-blur-sm grid place-items-center px-4"
          >
            <motion.div
              initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="panel rounded-3xl p-6 max-w-md w-full relative"
            >
              <button onClick={() => setActive(null)} className="absolute top-3 right-3 size-8 rounded-lg hover:bg-white/5 grid place-items-center text-ink-dim">
                <X size={16} />
              </button>
              <div className="text-[10px] uppercase tracking-widest text-purple-300/80 font-semibold">
                {STATE_LABEL[active.state]} · taught in {active.occurrences} mission{active.occurrences === 1 ? "" : "s"}
              </div>
              <h3 className="text-2xl font-bold text-gradient-mastery mt-1 mb-4">{active.label}</h3>
              <div className="space-y-2">
                {active.missionIds.map((id) => {
                  const m = MISSION_BY_ID[id];
                  if (!m) return null;
                  return (
                    <Link
                      key={id}
                      href={`/mission/${id}`}
                      onClick={() => setActive(null)}
                      className="panel-soft rounded-xl px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                    >
                      <div className="size-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-400/30 grid place-items-center text-[10px] uppercase tracking-widest text-cyan-200">
                        {m.branch.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink truncate">{m.episodeShortTitle}</div>
                        <div className="text-[11px] text-ink-faint truncate">{m.guests.join(" · ")}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-dim">
      <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  );
}
