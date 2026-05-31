"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ListOrdered, LayoutGrid } from "lucide-react";
import { TechTree } from "@/components/tree/TechTree";
import { Legend } from "@/components/tree/Legend";
import { EpisodeTimeline } from "@/components/timeline/EpisodeTimeline";
import { AuthButton } from "@/components/auth/AuthButton";
import { MicLogo } from "@/components/primitives/MicLogo";
import { HexLevel } from "@/components/primitives/HexLevel";
import { useStore } from "@/lib/store";
import { computeStreak } from "@/lib/streak";
import { TodaySession } from "@/components/dashboard/TodaySession";
import { ALL_MISSIONS } from "@/content/missions";

// DashboardStrip below the fold — dynamically imported so it doesn't block first paint.
// (ConceptCloud was killed — it duplicated the map without adding signal.)
const DashboardStrip = dynamic(
  () => import("@/components/dashboard/DashboardStrip").then((m) => m.DashboardStrip),
  { ssr: false, loading: () => <div className="h-64 mt-6 panel rounded-2xl animate-pulse opacity-40" /> },
);

export default function HomePage() {
  const { level, xp, xpToNext, streak: seedStreak, missions } = useStore();
  const streak = useMemo(() => Math.max(computeStreak(missions), seedStreak), [missions, seedStreak]);
  // Single-podcast MVP — no podcast filter needed; everything is Moonshots.
  const podcastFilter = "all" as const;
  // Timeline is the default primary view for Moonshots' weekly multi-topic format;
  // the thematic cluster map is an optional secondary lens.
  const [viewMode, setViewMode] = useState<"timeline" | "clusters">("timeline");

  // Map-header progress: how many episodes the user has mastered (≥80) in the
  // currently-filtered view. Drives the "3 of 15 mastered" pill + thin bar.
  const { mastered, total } = useMemo(() => {
    const inView = podcastFilter === "all"
      ? ALL_MISSIONS
      : ALL_MISSIONS.filter((m) => m.podcastId === podcastFilter);
    return {
      total: inView.length,
      mastered: inView.filter((m) => (missions[m.id]?.score ?? 0) >= 80).length,
    };
  }, [podcastFilter, missions]);
  const masteryPct = total ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1480px] mx-auto">
      {/* Mobile header */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MicLogo size={44} />
          <div>
            <div className="text-xl font-bold text-gradient-cyber leading-tight">MoonshotsMastery</div>
            <div className="text-[11px] text-ink-dim">Master the Moonshots feed</div>
          </div>
        </div>
        <AuthButton variant="topbar" />
      </div>

      {/* Mobile XP card */}
      <div className="md:hidden mb-5">
        <div className="panel rounded-2xl px-4 py-3 grid grid-cols-3 gap-3 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Level</div>
            <div className="mt-1 grid place-items-center">
              <HexLevel level={level} size={56} />
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Total XP</div>
            <div className="mt-1 text-2xl font-bold font-mono">{xp.toLocaleString()}</div>
            <div className="text-[10px] text-ink-dim">/ {xpToNext.toLocaleString()} XP</div>
            <div className="mt-2 h-1.5 rounded-full bg-bg-line overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(100, (xp / xpToNext) * 100)}%`,
                background: "linear-gradient(90deg,#22D3EE,#A855F7)",
                boxShadow: "0 0 14px rgba(34,211,238,0.6)",
              }} />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Streak</div>
            <div className="mt-1 inline-flex items-center gap-2">
              <span className="text-orange-400" style={{ filter: "drop-shadow(0 0 8px rgba(251,146,60,0.7))" }}>🔥</span>
              <span className="text-2xl font-bold text-orange-300 font-mono">{streak}</span>
            </div>
            <div className="text-[10px] text-ink-dim">days</div>
          </div>
        </div>
      </div>

      {/* Today's Mastery Session — the daily driver. Leads the page so a returning
          user sees their single next action before the browse-everything map. */}
      <div className="mb-6">
        <TodaySession />
      </div>

      {/* Desktop heading */}
      <div className="hidden md:flex items-end justify-between mb-4 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">The Feed</div>
          <h1 className="mt-1 text-4xl font-bold text-gradient-mastery">Episode Timeline</h1>
          <p className="mt-1 text-ink-dim text-sm">Newest first. Master any episode in any order — and watch how the big threads evolve.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MapProgressPill mastered={mastered} total={total} pct={masteryPct} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Mobile heading */}
      <div className="md:hidden mb-3 text-center">
        <h1 className="text-2xl font-bold text-gradient-mastery">Episode Timeline</h1>
        <p className="text-[11px] text-ink-dim">Newest first · master in any order</p>
        <div className="mt-2 flex justify-center"><MapProgressPill mastered={mastered} total={total} pct={masteryPct} /></div>
        <div className="mt-2 flex justify-center"><ViewToggle mode={viewMode} onChange={setViewMode} /></div>
      </div>

      {viewMode === "timeline" ? (
        <div className="max-w-3xl">
          <EpisodeTimeline podcastFilter={podcastFilter} />
        </div>
      ) : (
        <div className="panel rounded-2xl p-4 md:p-6 overflow-hidden relative">
          <TechTree podcastFilter={podcastFilter} />
          <div className="mt-4">
            <Legend />
          </div>
        </div>
      )}

      <div className="cv-auto">
        <DashboardStrip />
      </div>
    </div>
  );
}

/** Timeline (default) vs thematic-cluster view switch. */
function ViewToggle({ mode, onChange }: { mode: "timeline" | "clusters"; onChange: (m: "timeline" | "clusters") => void }) {
  const opts: { key: "timeline" | "clusters"; label: string; icon: typeof ListOrdered }[] = [
    { key: "timeline", label: "Timeline", icon: ListOrdered },
    { key: "clusters", label: "Clusters", icon: LayoutGrid },
  ];
  return (
    <div className="inline-flex panel-soft rounded-xl p-0.5">
      {opts.map((o) => {
        const Icon = o.icon;
        const active = mode === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              active ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/40" : "text-ink-dim hover:text-ink"
            }`}
          >
            <Icon size={13} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact pill showing mastery progress across the current filter view. */
function MapProgressPill({ mastered, total, pct }: { mastered: number; total: number; pct: number }) {
  return (
    <div className="inline-flex items-center gap-2 panel-soft rounded-full px-3 py-1.5">
      <span className="text-[10px] uppercase tracking-widest text-ink-dim">Mastered</span>
      <span className="text-sm font-bold font-mono text-emerald-300">
        {mastered}<span className="text-ink-faint">/{total}</span>
      </span>
      <div className="w-20 h-1 rounded-full bg-bg-line overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg,#22D3EE,#22C55E)",
            boxShadow: "0 0 8px rgba(34,197,94,0.5)",
          }}
        />
      </div>
    </div>
  );
}
