"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, ArrowRight, Flame, Brain, Sparkles, RefreshCw } from "lucide-react";
import { ALL_MISSIONS } from "@/content/missions";
import { useStore } from "@/lib/store";
import { buildSession } from "@/lib/review";
import { buildConceptStats } from "@/lib/concepts";
import { computeStreak } from "@/lib/streak";

/**
 * "Today's Mastery Session" — the daily driver. Answers "what should I do now?"
 *
 * Priority (no review debt, no guilt):
 *   1. Continue an in-progress episode
 *   2. Start the newest unmastered episode
 *   3. Optionally refresh a weak CONCEPT (concept-level, never episode-level)
 *
 * Mastered episodes are done and never resurface here.
 */
export function TodaySession() {
  const router = useRouter();
  const missions = useStore((s) => s.missions);
  const seedStreak = useStore((s) => s.streak);
  const hydrated = useStore((s) => s.hydrated);

  const { queue, streak, masteredCount, weakConcept } = useMemo(() => {
    const q = buildSession(ALL_MISSIONS, missions, 4);
    const concepts = buildConceptStats(ALL_MISSIONS, missions);
    const weak = concepts.find((c) => c.state === "weak");
    return {
      queue: q,
      streak: Math.max(computeStreak(missions), seedStreak),
      masteredCount: Object.values(missions).filter((a) => a.score >= 80).length,
      weakConcept: weak,
    };
  }, [missions, seedStreak]);

  if (!hydrated) {
    return <div className="panel rounded-3xl p-6 md:p-7 h-[220px] animate-pulse opacity-40" />;
  }

  const primary = queue[0];
  const rest = queue.slice(1, 4);
  const accent = primary?.kind === "finish" ? "#22D3EE" : "#A855F7";
  const allMastered = !primary;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative panel rounded-3xl p-6 md:p-7 overflow-hidden"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}26` }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(700px 240px at 12% -20%, ${accent}1f, transparent 60%)` }}
      />

      <div className="relative">
        {/* Header: title + honest live stats (no "due" debt) */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold" style={{ color: `${accent}E0` }}>
              <Sparkles size={13} /> Today&apos;s Mastery Session
            </div>
            <h2 className="mt-1.5 text-2xl md:text-3xl font-bold text-ink leading-tight">
              {allMastered
                ? "Every episode mastered"
                : primary.kind === "finish"
                  ? "Pick up where you left off"
                  : "Start your next episode"}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Stat icon={<Flame size={14} className="text-orange-300" />} value={streak} label="day streak" />
            <Stat icon={<Brain size={14} className="text-emerald-300" />} value={masteredCount} label="mastered" />
          </div>
        </div>

        {!allMastered ? (
          <>
            <button
              onClick={() => router.push(`/mission/${primary.mission.id}/check`)}
              className="group mt-5 w-full text-left rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-colors"
              style={{ background: `${accent}14`, border: `1px solid ${accent}55`, boxShadow: `0 0 30px ${accent}22` }}
            >
              <div className="size-12 rounded-xl grid place-items-center shrink-0" style={{ background: `${accent}26`, boxShadow: `inset 0 0 0 1px ${accent}66` }}>
                <Play size={22} style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>
                    {primary.kind === "finish" ? `Continue · best ${primary.bestScore ?? 0}` : "New episode"}
                  </span>
                  {primary.mission.episodeNumber != null && (
                    <span className="text-[10px] font-mono text-ink-faint">#{primary.mission.episodeNumber}</span>
                  )}
                </div>
                <div className="text-base md:text-lg font-bold text-ink truncate mt-0.5">{primary.mission.episodeShortTitle}</div>
                <div className="text-[12px] text-ink-dim mt-0.5">{primary.reason}</div>
              </div>
              <div className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-transform group-hover:translate-x-0.5" style={{ background: accent, color: "#05060F" }}>
                {primary.kind === "finish" ? "Continue" : "Start"}
                <ArrowRight size={15} />
              </div>
            </button>

            {rest.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2">Up next</div>
                <div className="grid sm:grid-cols-3 gap-2">
                  {rest.map((item) => (
                    <button
                      key={item.mission.id}
                      onClick={() => router.push(`/mission/${item.mission.id}`)}
                      className="text-left panel-soft rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors"
                    >
                      <div className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: item.kind === "finish" ? "#67E8F9" : "#C4B5FD" }}>
                        {item.kind === "finish" ? "Continue" : "New"}
                      </div>
                      <div className="text-[12px] font-medium text-ink truncate mt-0.5">{item.mission.episodeShortTitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 panel-soft rounded-2xl p-5 text-center">
            <div className="text-sm text-ink">
              Every episode mastered. Pick a new episode or refresh a weak concept. 🧠
            </div>
          </div>
        )}

        {/* Optional concept refresh — concept-level, never episode-level guilt.
            Only appears when the user actually has a weak concept worth a look. */}
        {weakConcept && (
          <div className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 panel-soft">
            <RefreshCw size={14} className="text-amber-300 shrink-0" />
            <div className="text-[12px] text-ink-dim flex-1 min-w-0">
              <span className="text-ink-dim">Optional refresh — a concept worth revisiting: </span>
              <span className="text-amber-200 font-medium">{weakConcept.label}</span>
            </div>
            <button
              onClick={() => router.push("/progress")}
              className="text-[11px] text-amber-200 hover:text-amber-100 shrink-0 inline-flex items-center gap-1"
            >
              Refresh concepts <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="panel-soft rounded-xl px-3 py-2 flex items-center gap-2">
      {icon}
      <div className="leading-none">
        <div className="text-base font-bold font-mono text-ink">{value}</div>
        <div className="text-[9px] uppercase tracking-wider text-ink-dim mt-0.5">{label}</div>
      </div>
    </div>
  );
}
