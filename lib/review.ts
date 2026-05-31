import type { Mission, MissionAttempt } from "./types";

/**
 * Spaced-repetition engine — the mechanic that turns a one-shot quiz score into
 * DURABLE mastery. A mastered episode doesn't stay mastered forever; it surfaces
 * for review on a widening interval (Leitner / SM-2-lite). Recall it well and the
 * interval grows; struggle and it shrinks. This is what makes the product a
 * mastery system rather than a quiz.
 *
 * Intervals by stage (days). Stage advances on a strong recall (score ≥ 80),
 * holds on a fair one (65-79), and drops back on a weak one (< 65).
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 16, 35, 90];

const DAY_MS = 24 * 60 * 60 * 1000;

/** The lifecycle state of a mission for the current user. Mastered is terminal. */
export type MasteryState =
  | "not_started"
  | "in_progress"   // attempted, best score < 80
  | "mastered";     // best score ≥ 80 — permanent, never decays

/**
 * Given the prior attempt (or none) and a new score, compute the next review
 * schedule. Pure — caller persists the result.
 */
export function scheduleReview(
  prevStage: number | undefined,
  score: number,
  now: Date = new Date(),
): { reviewStage: number; reviewDue: string } {
  const prev = typeof prevStage === "number" ? prevStage : -1;

  let stage: number;
  if (score >= 80) stage = prev + 1;          // strong recall → advance
  else if (score >= 65) stage = Math.max(prev, 0); // fair → hold
  else stage = 0;                              // weak → reset to short interval

  stage = Math.max(0, Math.min(stage, REVIEW_INTERVALS_DAYS.length - 1));
  const intervalDays = REVIEW_INTERVALS_DAYS[stage];
  const reviewDue = new Date(now.getTime() + intervalDays * DAY_MS).toISOString();
  return { reviewStage: stage, reviewDue };
}

/**
 * Derive the lifecycle state for a single mission.
 *
 * IMPORTANT product rule: once an episode is mastered it stays mastered —
 * permanently. We deliberately do NOT decay mastered episodes back into a
 * "review due" state. Re-listening to a finished episode is not something the
 * user should be nagged into. Any review is concept-level and optional (see
 * the Progress page / weak concepts), never episode-level guilt.
 */
export function masteryState(
  attempt: MissionAttempt | undefined,
): MasteryState {
  if (!attempt) return "not_started";
  if (attempt.score < 80) return "in_progress";
  return "mastered";
}

export interface SessionItem {
  mission: Mission;
  kind: "finish" | "new";
  /** Human reason shown on the card. */
  reason: string;
  /** Best prior score, if any. */
  bestScore?: number;
}

/**
 * Builds today's mastery session — the single most important thing on the home
 * screen. Priority order (no review-debt, no guilt):
 *
 *   1. FINISH — attempted but not yet mastered (closest to 80 first → quickest win).
 *   2. NEW    — never attempted (newest episode first → matches the feed).
 *
 * Mastered episodes never appear here; they're done. Returns an ordered queue;
 * the UI leads with item[0] as the primary CTA and shows the rest as "up next".
 */
export function buildSession(
  allMissions: Mission[],
  attempts: Record<string, MissionAttempt>,
  limit = 4,
): SessionItem[] {
  const finishes: SessionItem[] = [];
  const news: SessionItem[] = [];

  for (const m of allMissions) {
    const a = attempts[m.id];
    const state = masteryState(a);
    if (state === "in_progress" && a) {
      finishes.push({ mission: m, kind: "finish", reason: "Pick up where you left off", bestScore: a.score });
    } else if (state === "not_started") {
      news.push({ mission: m, kind: "new", reason: "New episode — master it in any order" });
    }
  }

  finishes.sort((x, y) => (y.bestScore ?? 0) - (x.bestScore ?? 0)); // nearest to mastery first
  news.sort((x, y) => y.mission.releasedDate.localeCompare(x.mission.releasedDate)); // newest first

  return [...finishes, ...news].slice(0, limit);
}

/** Real per-day XP for the last `days` days (replaces the old hardcoded bars). */
export function dailyXp(
  allMissions: Mission[],
  attempts: Record<string, MissionAttempt>,
  days = 7,
  now: Date = new Date(),
): { day: string; xp: number }[] {
  const xpById = new Map(allMissions.map((m) => [m.id, m.xp]));
  const buckets: { day: string; xp: number }[] = [];
  const labels = ["S", "M", "T", "W", "T", "F", "S"];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    buckets.push({ day: labels[d.getDay()], xp: 0 });
  }
  const startOfWindow = new Date(now.getTime() - (days - 1) * DAY_MS);
  startOfWindow.setHours(0, 0, 0, 0);

  for (const [id, a] of Object.entries(attempts)) {
    if (!a.completedAt) continue;
    const t = new Date(a.completedAt).getTime();
    const idx = Math.floor((t - startOfWindow.getTime()) / DAY_MS);
    if (idx < 0 || idx >= days) continue;
    const base = xpById.get(id) ?? 0;
    buckets[idx].xp += Math.round((base * a.score) / 100);
  }
  return buckets;
}
