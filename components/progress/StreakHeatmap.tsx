"use client";
import { useMemo } from "react";
import type { MissionAttempt } from "@/lib/types";

/**
 * Streak heatmap — last N days, GitHub contributions style.
 *
 * Cell intensity is driven by the mastery score achieved on any mission
 * completed that day. Multiple completions on the same day take the max.
 * Days with no activity render as faint placeholders.
 */
export function StreakHeatmap({ missions, days = 90 }: { missions: Record<string, MissionAttempt>; days?: number }) {
  const cells = useMemo(() => {
    // Use a LOCAL day key everywhere. Mixing local-midnight dates with UTC
    // toISOString() previously collapsed two local days into one key across a
    // DST boundary (e.g. 2026-03-29 in Europe), causing duplicate React keys.
    const localKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const byDay = new Map<string, number>();
    for (const a of Object.values(missions)) {
      if (!a.completedAt) continue;
      const key = localKey(new Date(a.completedAt));
      byDay.set(key, Math.max(byDay.get(key) ?? 0, a.score));
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { key: string; score: number; date: Date }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = localKey(d);
      out.push({ key, score: byDay.get(key) ?? 0, date: d });
    }
    return out;
  }, [missions, days]);

  // Pad to start on a Sunday-aligned grid (7 rows × N cols).
  const firstDay = cells[0]?.date.getDay() ?? 0;
  const padded = [
    ...Array.from({ length: firstDay }, () => null as null | (typeof cells)[number]),
    ...cells,
  ];

  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 font-semibold mb-2">
        Last {days} days
      </div>
      <div
        className="grid gap-1"
        style={{
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, 12px)",
        }}
      >
        {padded.map((c, i) => {
          if (!c) return <div key={`pad-${i}`} className="size-3" />;
          const level = scoreToLevel(c.score);
          return (
            <div
              key={c.key}
              title={`${c.key} — ${c.score > 0 ? `${c.score}/100` : "no activity"}`}
              className="size-3 rounded-[3px]"
              style={{
                background: LEVEL_COLORS[level],
                boxShadow: level >= 3 ? "0 0 6px rgba(34,197,94,0.4)" : undefined,
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-faint">
        <span>Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className="size-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

const LEVEL_COLORS = [
  "rgba(99,102,241,0.06)",   // 0 — no activity
  "rgba(34,211,238,0.25)",   // 1 — light
  "rgba(34,211,238,0.55)",   // 2 — medium
  "rgba(34,197,94,0.7)",     // 3 — strong
  "rgba(34,197,94,1)",       // 4 — mastered
];

function scoreToLevel(s: number): number {
  if (s <= 0) return 0;
  if (s < 50) return 1;
  if (s < 75) return 2;
  if (s < 90) return 3;
  return 4;
}
