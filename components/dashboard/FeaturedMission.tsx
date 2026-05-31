"use client";
import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ALL_MISSIONS } from "@/content/missions";
import { useStore } from "@/lib/store";

/**
 * Picks the most useful mission to surface to the user *right now*:
 *   1. In-progress and below mastery (highest score below 80 → easiest to flip)
 *   2. Otherwise, the most recently completed (re-take to beat your best)
 *   3. Otherwise, the first unattempted in the catalog
 */
export function FeaturedMission() {
  const missions = useStore((s) => s.missions);

  const featured = useMemo(() => {
    const inProgress = ALL_MISSIONS
      .filter((m) => missions[m.id] && missions[m.id].score < 80)
      .sort((a, b) => (missions[b.id].score - missions[a.id].score));
    if (inProgress.length) return { mission: inProgress[0], reason: "in_progress" as const };

    const untouched = ALL_MISSIONS.find((m) => !missions[m.id]);
    if (untouched) return { mission: untouched, reason: "untouched" as const };

    const lastMastered = ALL_MISSIONS
      .filter((m) => missions[m.id])
      .sort((a, b) => (missions[b.id].completedAt ?? "").localeCompare(missions[a.id].completedAt ?? ""))[0];
    return { mission: lastMastered ?? ALL_MISSIONS[0], reason: "completed" as const };
  }, [missions]);

  const m = featured.mission;
  const attempt = missions[m.id];

  const banner =
    featured.reason === "in_progress" ? "Up next · finish what you started" :
    featured.reason === "untouched"   ? "Recommended · next mission in your path" :
                                        "Try again · beat your best score";

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
      className="panel rounded-2xl p-5 md:p-6 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-400/30 grid place-items-center">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">{banner}</div>
            <h2 className="text-xl font-bold text-ink leading-tight mt-0.5">
              {m.episodeShortTitle}
            </h2>
          </div>
        </div>
        {attempt && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-200">
            Best {attempt.score}
          </span>
        )}
      </div>

      <p className="text-sm text-ink-dim leading-relaxed mb-4">{m.summary}</p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Meta label="Duration"   value={m.duration} />
        <Meta label="Released"   value={m.releasedDate} />
        <Meta label="Difficulty" value={m.difficulty} />
      </div>

      <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2">Key Concepts</div>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {m.concepts.slice(0, 6).map((c) => (
          <span key={c.id} className={chipClass(c.color)}>
            <span className="size-1.5 rounded-full" style={{ background: chipDot(c.color) }} />
            {c.label}
          </span>
        ))}
      </div>

      <Link
        href={`/mission/${m.id}`}
        className="mt-auto group relative overflow-hidden rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors px-4 py-3.5 flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400/60"
        style={{ boxShadow: "0 0 24px rgba(34,211,238,0.25)" }}
      >
        <div className="flex items-center gap-3">
          <span className="size-9 rounded-lg bg-cyan-400/20 grid place-items-center">
            <span className="text-cyan-200">⚡</span>
          </span>
          <div>
            <div className="text-sm font-bold text-cyan-100">
              {attempt ? "Re-take Mastery Check" : "Start Mastery Check"}
            </div>
            <div className="text-[11px] text-cyan-300/80">
              {attempt ? `Best ${attempt.score}% · earn ${Math.max(0, m.xp - Math.round(m.xp * attempt.score / 100))} bonus XP` : `${m.questions.length} questions · +${m.xp} XP available`}
            </div>
          </div>
        </div>
        <ArrowRight size={18} className="text-cyan-200 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.aside>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-soft rounded-lg px-2.5 py-2">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
      <div className="text-xs font-semibold mt-0.5 text-ink">{value}</div>
    </div>
  );
}

function chipClass(color?: string) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border";
  switch (color) {
    case "cyan":   return `${base} border-cyan-400/30 text-cyan-200 bg-cyan-500/10`;
    case "purple": return `${base} border-purple-400/30 text-purple-200 bg-purple-500/10`;
    case "amber":  return `${base} border-amber-400/30 text-amber-200 bg-amber-500/10`;
    case "green":  return `${base} border-emerald-400/30 text-emerald-200 bg-emerald-500/10`;
    default:       return `${base} border-white/10 text-ink-dim bg-white/5`;
  }
}
function chipDot(color?: string) {
  switch (color) {
    case "cyan":   return "#22D3EE";
    case "purple": return "#A855F7";
    case "amber":  return "#F59E0B";
    case "green":  return "#22C55E";
    default:       return "#52525B";
  }
}
