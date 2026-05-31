"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { HexLevel } from "@/components/primitives/HexLevel";
import { StreakFlame } from "@/components/primitives/StreakFlame";
import { XPBar } from "@/components/primitives/XPBar";
import { Counter } from "@/components/primitives/Counter";
import { computeStreak } from "@/lib/streak";
import { isMuted, setMuted } from "@/lib/sounds";
import { AuthButton } from "@/components/auth/AuthButton";

export function Topbar() {
  const { level, xp, xpToNext, streak: seedStreak, missions, hydrated } = useStore();
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);
  const liveStreak = useMemo(() => {
    const computed = computeStreak(missions);
    // Show whichever is higher so the demo-seeded streak isn't visually demoted
    return Math.max(computed, seedStreak);
  }, [missions, seedStreak]);

  return (
    <header className="hidden md:flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-bg-base/95">
      <button
        type="button"
        onClick={() => {
          // Dispatch a synthetic ⌘K keydown so the palette opens via its global listener.
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true }));
        }}
        className="relative flex-1 max-w-xl flex items-center bg-bg-card/60 border border-white/5 rounded-xl pl-9 pr-16 py-2.5 text-sm text-left text-ink-faint hover:border-cyan-400/30 transition"
      >
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
        <span>Search missions, concepts, or episodes…</span>
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
      <button
        type="button"
        onClick={() => {
          const next = !muted;
          setMuted(next); setMutedState(next);
        }}
        title={muted ? "Sound is muted" : "Sound on"}
        aria-label={muted ? "Unmute sound" : "Mute sound"}
        className="size-9 rounded-xl panel-soft grid place-items-center text-ink-dim hover:text-ink transition-colors"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("Reset progress and replay the intro tour? (Demo only)")) {
            try { localStorage.removeItem("pm:onboarded:v1"); } catch {}
            useStore.getState().resetProgress();
            location.reload();
          }
        }}
        title="Reset demo state — replays onboarding"
        aria-label="Reset demo state"
        className="size-9 rounded-xl panel-soft grid place-items-center text-ink-dim hover:text-ink transition-colors"
      >
        <RotateCcw size={16} />
      </button>
      <StreakFlame days={liveStreak} />
      <div className="flex items-center gap-3 panel rounded-xl px-3.5 py-2 min-w-[280px]">
        <HexLevel level={level} size={44} />
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold font-mono">
              {hydrated ? <Counter value={xp} /> : xp.toLocaleString()}
            </span>
            <span className="text-[11px] text-ink-dim">/ {xpToNext.toLocaleString()} XP</span>
          </div>
          <XPBar xp={xp} max={xpToNext} />
        </div>
      </div>
      <AuthButton variant="topbar" />
    </header>
  );
}
