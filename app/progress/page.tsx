"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Sparkles, Trophy, Target, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";
import { buildConceptStats } from "@/lib/concepts";
import { computeStreak } from "@/lib/streak";
import { XPBar } from "@/components/primitives/XPBar";
import { StreakHeatmap } from "@/components/progress/StreakHeatmap";

export default function ProgressPage() {
  const hydrated = useStore((s) => s.hydrated);
  const level = useStore((s) => s.level);
  const xp = useStore((s) => s.xp);
  const xpToNext = useStore((s) => s.xpToNext);
  const seedStreak = useStore((s) => s.streak);
  const missions = useStore((s) => s.missions);
  const badges = useStore((s) => s.badges);

  // All derived state computed unconditionally — hooks must not be gated.
  const streak = useMemo(() => Math.max(computeStreak(missions), seedStreak), [missions, seedStreak]);

  const conceptStats = useMemo(() => buildConceptStats(ALL_MISSIONS, missions), [missions]);
  const conceptsMastered = conceptStats.filter((c) => c.state === "mastered").length;
  const weakConcepts = useMemo(
    () => Array.from(new Set(Object.values(missions).flatMap((a) => a.weakConcepts ?? []))).slice(0, 8),
    [missions]
  );

  const recommended = useMemo(
    () =>
      ALL_MISSIONS
        .filter((m) => !missions[m.id] || missions[m.id].score < 80)
        .slice(0, 3),
    [missions]
  );

  // Don't render dynamic store-driven content until zustand has rehydrated from localStorage.
  // Otherwise the server-rendered HTML differs from the client tree → hydration mismatch crash.
  if (!hydrated) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
        <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">Your Path</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gradient-mastery">Progress &amp; Achievements</h1>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="panel rounded-2xl p-5 md:col-span-2 h-28 animate-pulse" />
          <div className="panel rounded-2xl p-5 h-28 animate-pulse" />
        </div>
        <div className="mt-6 panel rounded-2xl p-5 h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
      <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">Your Path</div>
      <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gradient-mastery">Progress &amp; Achievements</h1>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="panel rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim">Level</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-bold text-gradient-cyber font-mono">{level}</span>
                <span className="text-ink-dim text-sm">Mastery Apprentice</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-ink-dim">Total XP</div>
              <div className="text-2xl font-bold font-mono">{xp.toLocaleString()}</div>
              <div className="text-[10px] text-ink-faint">/ {xpToNext.toLocaleString()}</div>
            </div>
          </div>
          <XPBar xp={xp} max={xpToNext} />
        </div>

        <div className="panel rounded-2xl p-5 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/40 grid place-items-center"
            style={{ boxShadow: "0 0 24px rgba(251,146,60,0.4)" }}>
            <Flame size={24} className="text-orange-300" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-orange-200/70">Current streak</div>
            <div className="text-3xl font-bold text-orange-300 font-mono">{streak}</div>
            <div className="text-[11px] text-orange-200/70">day streak — keep it alive</div>
          </div>
        </div>
      </div>

      {/* Streak heatmap — gives visceral proof of consistency at a glance. */}
      <div className="mt-6 panel rounded-2xl p-5 overflow-x-auto">
        <StreakHeatmap missions={missions} days={90} />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-amber-300" />
            <div className="text-[11px] uppercase tracking-widest text-amber-200/80 font-semibold">Badge Collection</div>
            <span className="ml-auto text-[11px] text-ink-dim">{badges.length} earned</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {ALL_MISSIONS.map((m, i) => {
              const earned = badges.includes(m.badge.name);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="panel-soft rounded-xl p-3 flex flex-col items-center text-center gap-1.5"
                >
                  <BadgeHex color={earned ? rarityColor(m.badge.rarity) : "#3F3F46"} earned={earned} />
                  <div className={`text-[10px] font-semibold leading-tight ${earned ? "text-ink" : "text-ink-faint"}`}>
                    {m.badge.name}
                  </div>
                  <div
                    className={`text-[9px] uppercase tracking-wider ${earned ? "" : "text-ink-faint"}`}
                    style={earned ? { color: rarityColor(m.badge.rarity) } : undefined}
                  >
                    {m.badge.rarity}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-cyan-300" />
              <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 font-semibold">Concepts Mastered</div>
            </div>
            <div className="text-4xl font-bold font-mono text-gradient-mastery">
              {conceptsMastered}
              <span className="text-base text-ink-dim font-sans"> / {conceptStats.length}</span>
            </div>
            <div className="text-[11px] text-ink-dim mt-1">across {Object.keys(missions).length} mission{Object.keys(missions).length === 1 ? "" : "s"} attempted</div>
          </div>

          <div className="panel rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-300" />
              <div className="text-[11px] uppercase tracking-widest text-amber-300/80 font-semibold">Weak Concepts</div>
            </div>
            {weakConcepts.length === 0 ? (
              <div className="text-sm text-ink-dim">No gaps detected. Mastery streak is clean.</div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {weakConcepts.map((c, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-200">
                    {c.length > 50 ? c.slice(0, 47) + "…" : c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-cyan-300" />
          <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 font-semibold">Recommended next</div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {recommended.map((m) => (
            <Link key={m.id} href={`/mission/${m.id}`} className="panel rounded-2xl p-4 hover:bg-white/[0.03] transition-colors group block">
              <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">{m.branch}</div>
              <div className="font-bold text-ink mt-0.5 line-clamp-2">{m.episodeShortTitle}</div>
              <div className="text-[11px] text-ink-dim mt-1 line-clamp-2">{m.summary}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-cyan-300">+{m.xp} XP</span>
                <ArrowRight size={14} className="text-ink-faint group-hover:text-cyan-200 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function rarityColor(r: string) {
  return r === "legendary" ? "#F59E0B" : r === "epic" ? "#A855F7" : r === "rare" ? "#22D3EE" : "#94A3B8";
}

function BadgeHex({ color, earned }: { color: string; earned: boolean }) {
  const size = 56;
  const r = size / 2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <polygon
          points={pts}
          fill={`${color}1f`}
          stroke={color}
          strokeWidth={2}
          style={earned ? { filter: `drop-shadow(0 0 10px ${color})` } : { opacity: 0.7 }}
        />
      </svg>
      <Trophy size={20} className="absolute" color={earned ? color : "#52525B"} />
    </div>
  );
}
