"use client";
import { useMemo, useState } from "react";
import { ALL_MISSIONS } from "@/content/missions";
import { useStore } from "@/lib/store";
import { masteryState } from "@/lib/review";
import { threadsForMission, THREADS } from "@/lib/threads";
import { TimelineCard } from "./TimelineCard";

/**
 * Timeline-first episode view — the primary home surface for Moonshots.
 *
 * Moonshots episodes are weekly multi-topic discussions, so a category grid is
 * misleading. This presents them as what they are: a chronological feed (newest
 * first) where any episode can be mastered in any order, with month markers and
 * a secondary thread filter to follow a storyline across time.
 */
export function EpisodeTimeline({ podcastFilter = "all" }: { podcastFilter?: "all" | string }) {
  const missions = useStore((s) => s.missions);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = podcastFilter === "all"
      ? ALL_MISSIONS
      : ALL_MISSIONS.filter((m) => m.podcastId === podcastFilter);
    if (activeThread) {
      list = list.filter((m) => threadsForMission(m).some((t) => t.id === activeThread));
    }
    // ALL_MISSIONS is already newest-first; keep that.
    return list;
  }, [podcastFilter, activeThread]);

  // Which threads actually appear in the (podcast-filtered) catalog — only offer those.
  const availableThreads = useMemo(() => {
    const base = podcastFilter === "all" ? ALL_MISSIONS : ALL_MISSIONS.filter((m) => m.podcastId === podcastFilter);
    const present = new Set<string>();
    base.forEach((m) => threadsForMission(m).forEach((t) => present.add(t.id)));
    return THREADS.filter((t) => present.has(t.id));
  }, [podcastFilter]);

  return (
    <div>
      {/* Thread filter — secondary control, not the primary layout */}
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-widest text-ink-dim mb-2">Follow a thread across time</div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All episodes" active={!activeThread} onClick={() => setActiveThread(null)} />
          {availableThreads.map((t) => (
            <FilterChip
              key={t.id}
              label={t.label}
              color={t.color}
              active={activeThread === t.id}
              onClick={() => setActiveThread(activeThread === t.id ? null : t.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeline spine + cards */}
      <div className="relative pl-5 md:pl-7">
        {/* vertical spine */}
        <div className="absolute left-1.5 md:left-2.5 top-1 bottom-1 w-px bg-gradient-to-b from-cyan-400/40 via-white/10 to-transparent" aria-hidden />

        {visible.length === 0 ? (
          <div className="py-10 text-sm text-ink-dim">No episodes match this thread yet.</div>
        ) : (
          visible.map((m, i) => {
            const prev = visible[i - 1];
            const showMonth = !prev || monthKey(prev.releasedDate) !== monthKey(m.releasedDate);
            const state = masteryState(missions[m.id]);
            return (
              <div key={m.id} className="relative">
                {showMonth && (
                  <div className="flex items-center gap-2 mt-2 mb-3 first:mt-0">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cyan-300/80">
                      {monthLabel(m.releasedDate)}
                    </span>
                    <span className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <div className="relative pb-4">
                  {/* node dot on the spine */}
                  <span
                    className="absolute -left-[18px] md:-left-[26px] top-5 size-3 rounded-full ring-2 ring-bg-base"
                    style={{
                      background: state === "mastered" ? "#34D399" : state === "in_progress" ? "#22D3EE" : "#3F3F5A",
                      boxShadow: state === "mastered" ? "0 0 10px rgba(16,185,129,0.9)" : state === "in_progress" ? "0 0 8px rgba(34,211,238,0.7)" : "none",
                    }}
                    aria-hidden
                  />
                  <TimelineCard mission={m} state={state} activeThread={activeThread} delay={i * 0.03} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors"
      style={{
        color: active ? (color ?? "#67E8F9") : "var(--ink-dim, #9aa0b5)",
        borderColor: active ? `${color ?? "#67E8F9"}` : "rgba(255,255,255,0.1)",
        background: active ? `${color ?? "#67E8F9"}22` : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function monthKey(iso: string) {
  return iso.slice(0, 7); // YYYY-MM
}
function monthLabel(iso: string) {
  const [y, m] = iso.split("-");
  const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[parseInt(m, 10)]} ${y}`;
}
