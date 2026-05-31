"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, GitCommitHorizontal } from "lucide-react";
import type { Mission } from "@/lib/types";
import type { MasteryState } from "@/lib/review";
import { threadsForMission, missionChanges, THREAD_BY_ID } from "@/lib/threads";

/**
 * A single episode in the chronological timeline. Status drives the entire
 * visual weight:
 *   - mastered    → saturated emerald, filled, glowing, MASTERED badge (permanent)
 *   - in_progress → cyan accent + "resume" affordance
 *   - not_started → dim/quiet, low contrast
 *
 * Thread chips show which long-running storylines the episode touches; a curated
 * "what changed" line surfaces when we have one (optionally filtered by thread).
 */
export function TimelineCard({
  mission,
  state,
  activeThread,
  delay = 0,
}: {
  mission: Mission;
  state: MasteryState;
  activeThread?: string | null;
  delay?: number;
}) {
  const threads = threadsForMission(mission);
  const changes = missionChanges(mission.id);
  // Prefer the change note matching the active thread filter; else the first one.
  const change =
    (activeThread && changes.find((c) => c.threadId === activeThread)) || changes[0];

  const mastered = state === "mastered";
  const inProgress = state === "in_progress";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(delay, 0.3) }}
      className="relative"
    >
      <Link
        href={`/mission/${mission.id}`}
        className={[
          "block rounded-2xl p-4 md:p-5 transition-colors group relative overflow-hidden",
          mastered
            ? "bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]"
            : inProgress
              ? "panel hover:bg-white/[0.04]"
              : "bg-white/[0.015] hover:bg-white/[0.04]",
        ].join(" ")}
        style={{
          border: mastered
            ? "1px solid rgba(16,185,129,0.5)"
            : inProgress
              ? "1px solid rgba(34,211,238,0.35)"
              : "1px solid rgba(255,255,255,0.06)",
          boxShadow: mastered ? "0 0 28px rgba(16,185,129,0.18)" : undefined,
        }}
      >
        {/* Mastered gets a soft emerald wash in the corner */}
        {mastered && (
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(420px 140px at 90% -20%, rgba(16,185,129,0.18), transparent 60%)" }} />
        )}

        <div className="relative">
          {/* Top row: meta + status badge */}
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
            {mission.episodeNumber != null && (
              <span className="font-mono text-ink-faint">#{mission.episodeNumber}</span>
            )}
            <span className="text-ink-faint">Moonshots</span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-faint font-mono normal-case tracking-normal">{mission.releasedDate}</span>
            <span className="ml-auto">
              {mastered ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-200 font-bold">
                  <CheckCircle2 size={11} strokeWidth={3} /> MASTERED
                </span>
              ) : inProgress ? (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-200 font-semibold">IN PROGRESS</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full border border-white/10 text-ink-faint">NOT STARTED</span>
              )}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`mt-2 text-base md:text-lg font-bold leading-tight ${mastered ? "text-ink" : inProgress ? "text-ink" : "text-ink-dim"}`}
            title={mission.episodeTitle}
          >
            {mission.episodeShortTitle}
          </h3>

          {/* Thread chips — which storylines this episode touches */}
          {threads.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {threads.slice(0, 5).map((t) => {
                const isActive = activeThread === t.id;
                return (
                  <span
                    key={t.id}
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{
                      color: t.color,
                      borderColor: `${t.color}${isActive ? "" : "55"}`,
                      background: `${t.color}${isActive ? "2e" : "14"}`,
                    }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          )}

          {/* "What changed" — the evolution signal */}
          {change && (
            <div className="mt-3 flex items-start gap-2 rounded-lg px-3 py-2"
              style={{ background: `${THREAD_BY_ID[change.threadId]?.color ?? "#67E8F9"}10` }}>
              <GitCommitHorizontal size={13} className="mt-0.5 shrink-0" style={{ color: THREAD_BY_ID[change.threadId]?.color }} />
              <span className="text-[12px] text-ink-dim leading-snug italic">{change.text}</span>
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ color: mastered ? "#6EE7B7" : inProgress ? "#67E8F9" : "#A5B4FC" }}>
            {mastered ? "Review or re-take" : inProgress ? "Continue mastering" : "Start mastering"}
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
