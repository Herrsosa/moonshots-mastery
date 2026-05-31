import type { Mission, MissionAttempt } from "./types";

export interface ConceptStat {
  id: string;
  label: string;
  color?: "cyan" | "purple" | "amber" | "green";
  /** How many missions teach this concept */
  occurrences: number;
  /** Missions that teach it */
  missionIds: string[];
  /** Personal status — derived from user attempts */
  state: "untouched" | "weak" | "in_progress" | "mastered";
}

/**
 * Aggregates every concept across every mission. The same concept ID can appear
 * in multiple missions; that's the whole point — it's how we visualize how
 * ideas connect across episodes.
 *
 * Personal `state` is computed from:
 *   - mastered     → user mastered (≥80) every mission that teaches it
 *   - in_progress  → user attempted at least one mission that teaches it but didn't master all
 *   - weak         → concept appears in user's weakConcepts list
 *   - untouched    → no attempts on any mission teaching it
 */
export function buildConceptStats(
  missions: Mission[],
  attempts: Record<string, MissionAttempt>
): ConceptStat[] {
  const map = new Map<string, ConceptStat>();

  for (const m of missions) {
    for (const c of m.concepts) {
      const existing = map.get(c.id);
      if (existing) {
        existing.occurrences += 1;
        existing.missionIds.push(m.id);
      } else {
        map.set(c.id, {
          id: c.id,
          label: c.label,
          color: c.color,
          occurrences: 1,
          missionIds: [m.id],
          state: "untouched",
        });
      }
    }
  }

  const weakSet = new Set<string>();
  for (const a of Object.values(attempts)) {
    for (const w of a.weakConcepts) weakSet.add(w.toLowerCase());
  }

  for (const c of map.values()) {
    const attemptedMissions = c.missionIds.filter((id) => attempts[id]);
    const masteredCount = c.missionIds.filter((id) => (attempts[id]?.score ?? 0) >= 80).length;

    if (weakSet.has(c.label.toLowerCase())) {
      c.state = "weak";
    } else if (attemptedMissions.length === 0) {
      c.state = "untouched";
    } else if (masteredCount === c.missionIds.length) {
      c.state = "mastered";
    } else {
      c.state = "in_progress";
    }
  }

  // Sort by occurrences (cross-cutting concepts first), then by label
  return Array.from(map.values()).sort(
    (a, b) => b.occurrences - a.occurrences || a.label.localeCompare(b.label)
  );
}
