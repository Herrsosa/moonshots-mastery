import type { MissionAttempt } from "./types";

/** Y/M/D in user-local time. */
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * Returns the current consecutive-day streak based on `completedAt` timestamps.
 * - Counts each distinct day with at least one completion
 * - Allows today OR yesterday as the most recent day before breaking the streak
 */
export function computeStreak(
  attempts: Record<string, MissionAttempt>,
  now: Date = new Date()
): number {
  const days = new Set<string>();
  for (const a of Object.values(attempts)) {
    if (!a.completedAt) continue;
    days.add(dayKey(new Date(a.completedAt)));
  }
  if (days.size === 0) return 0;

  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  // streak is alive if the most recent activity is today or yesterday
  let cursor: Date;
  if (days.has(today)) cursor = new Date(now);
  else if (days.has(yesterday)) cursor = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return streak;
}

/** Build a YouTube watch URL with a deep-linked timestamp from "MM:SS" or "HH:MM:SS". */
export function youtubeLinkAt(videoId: string | undefined, tStart: string): string | null {
  if (!videoId) return null;
  const parts = tStart.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return `https://www.youtube.com/watch?v=${videoId}`;
  let seconds = 0;
  if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
  else if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}
