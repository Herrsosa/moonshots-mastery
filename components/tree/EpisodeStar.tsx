"use client";
import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { BranchIcon } from "@/components/primitives/BranchIcon";
import type { Mission, NodeStatus } from "@/lib/types";
import type { Podcast } from "@/lib/podcasts";
import { PODCASTS } from "@/lib/podcasts";

/**
 * Visual weight is deliberately lopsided toward MASTERED — a mastered episode
 * should feel permanent, complete, and satisfying, clearly distinct from the
 * dim "not started" state. (See EpisodeTimeline for the primary home view; this
 * star is used by the optional cluster map.)
 */
const COLOR: Record<NodeStatus, { stroke: string; fill: string; glow: string; text: string }> = {
  mastered:    { stroke: "#34D399", fill: "rgba(16,185,129,0.30)", glow: "rgba(16,185,129,0.85)", text: "#A7F3D0" },
  in_progress: { stroke: "#22D3EE", fill: "rgba(34,211,238,0.12)", glow: "rgba(34,211,238,0.6)",  text: "#67E8F9" },
  available:   { stroke: "#3F3F5A", fill: "rgba(99,102,141,0.06)", glow: "rgba(99,102,141,0.18)", text: "#8B8BA7" },
};

const ICON_FOR_BRANCH: Record<string, "brain"|"robot"|"dna"|"bolt"|"rocket"|"leaf"|"chart"|"user"> = {
  ai: "brain", robotics: "robot", longevity: "dna", energy: "bolt",
  space: "rocket", biotech: "leaf", markets: "chart", abundance: "user",
};

const NODE     = 56;
const HALO     = 78;
const ICON_SZ  = 24;
const LABEL_W  = 124;

function EpisodeStarImpl({
  mission, status, podcast, onClick, delay = 0,
}: {
  mission: Mission;
  status: NodeStatus;
  podcast?: Podcast;
  onClick: () => void;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const c = COLOR[status];
  const isMastered = status === "mastered";
  const effDelay = reduced ? 0 : Math.min(delay, 0.25);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: effDelay, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
      className="group flex flex-col items-center gap-1.5 outline-none focus-visible:outline-none"
      aria-label={`Episode: ${mission.episodeShortTitle}, released ${mission.releasedDate}, ${status.replace("_", " ")}`}
    >
      <div className="relative grid place-items-center" style={{ width: HALO, height: HALO }}>
        {/* Halo — much brighter for mastered, near-invisible for not-started. */}
        <div
          className="absolute rounded-full"
          style={{
            width: HALO, height: HALO,
            background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
            opacity: isMastered ? 0.95 : status === "in_progress" ? 0.5 : 0.22,
          }}
        />
        {/* Node — mastered is a filled, saturated emerald disc; others are hollow. */}
        <motion.div
          className="relative grid place-items-center rounded-full"
          style={{
            width: NODE, height: NODE,
            background: isMastered
              ? `radial-gradient(closest-side, ${c.fill} 0%, rgba(6,20,15,0.9) 100%)`
              : `radial-gradient(closest-side, ${c.fill} 20%, rgba(5,6,15,0.75) 100%)`,
            border: `${isMastered ? 2.5 : 1.5}px solid ${c.stroke}`,
            boxShadow: isMastered
              ? `0 0 26px ${c.glow}, inset 0 0 18px ${c.glow}`
              : `0 0 16px ${c.glow}, inset 0 0 14px ${c.glow}`,
          }}
          animate={status === "in_progress" && !reduced
            ? { boxShadow: [
                `0 0 16px ${c.glow}, inset 0 0 14px ${c.glow}`,
                `0 0 24px ${c.glow}, inset 0 0 18px ${c.glow}`,
                `0 0 16px ${c.glow}, inset 0 0 14px ${c.glow}`,
              ] }
            : undefined}
          transition={status === "in_progress" && !reduced ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <BranchIcon iconKey={ICON_FOR_BRANCH[mission.branch] ?? "brain"} size={ICON_SZ} color={isMastered ? "#ECFDF5" : c.stroke} />
          {isMastered && (
            <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-400 grid place-items-center ring-2 ring-bg-base"
              style={{ boxShadow: "0 0 10px rgba(16,185,129,0.9)" }}>
              <CheckCircle2 size={11} className="text-emerald-950" strokeWidth={3} />
            </span>
          )}
        </motion.div>
      </div>

      {/* MASTERED micro-label — only on mastered, reinforces permanence. */}
      {isMastered && (
        <span className="text-[8px] font-bold tracking-[0.18em] text-emerald-300/90 -mb-0.5">MASTERED</span>
      )}

      {/* Title */}
      <div
        className={`text-[11px] font-semibold text-center leading-tight ${isMastered ? "text-ink" : status === "available" ? "text-ink-dim" : "text-ink"}`}
        style={{ width: LABEL_W, textShadow: "0 0 8px rgba(5,6,15,0.95)" }}
      >
        {mission.episodeNumber != null && (
          <span
            className="inline-block mr-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold align-middle"
            style={{ background: `${c.stroke}22`, color: c.text, border: `1px solid ${c.stroke}44` }}
          >
            #{mission.episodeNumber}
          </span>
        )}
        <span className="line-clamp-2 align-middle">{mission.episodeShortTitle}</span>
      </div>

      <div className="text-[9px] text-ink-faint font-mono flex items-center gap-1.5">
        {podcast && (
          <span className="size-1.5 rounded-full" style={{ background: podcast.color, boxShadow: `0 0 4px ${podcast.color}` }} title={podcast.shortName} />
        )}
        <span>{mission.releasedDate}</span>
        {podcast && PODCASTS.length > 1 && (
          <>
            <span className="opacity-50">·</span>
            <span>{podcast.shortName}</span>
          </>
        )}
      </div>
    </motion.button>
  );
}

export const EpisodeStar = memo(EpisodeStarImpl, (prev, next) => (
  prev.mission.id === next.mission.id &&
  prev.status === next.status &&
  prev.delay === next.delay &&
  prev.podcast?.id === next.podcast?.id
));
