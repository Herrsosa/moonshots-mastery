import type { Mission } from "@/lib/types";

// Original 6 missions — Moonshots interview / deep-dive episodes
import { schmidtRoboticsEnergy } from "./schmidt-robotics-energy";
import { daraRobotaxi } from "./dara-robotaxi";
import { daraQA } from "./dara-qa";
import { benLammColossal } from "./ben-lamm-colossal";
import { sinclairLongevityPill } from "./sinclair-longevity-pill";
import { sinclairGLP1AI } from "./sinclair-glp1-ai";

// 9 news / WTF-Just-Happened episodes — full Moonshots window 2026-03-21 → 2026-05-21
import { elonTerafab } from "./elon-terafab";
import { spacexIPO } from "./spacex-ipo";
import { muskVsAltman } from "./musk-vs-altman";
import { altmanAttackOpus } from "./altman-attack-opus";
import { cursorSaasKills } from "./cursor-saas-kills";
import { google40bAnthropic } from "./google-40b-anthropic";
import { demisAgiRobots } from "./demis-agi-robots";
import { googleRecordQuarter } from "./google-record-quarter";
import { anthropicSpacex } from "./anthropic-spacex";

// EP 256-258 — late May 2026 (post-launch transcript drop)
import { googleIoKarpathyCerebras } from "./google-io-karpathy-cerebras";
import { spacex75bIpoGpt55Erdos } from "./spacex-75b-ipo-gpt55-erdos";
import { organizationalSingularity } from "./organizational-singularity";

/**
 * Full Moonshots catalog — 15 episodes, all authored from real transcripts.
 *
 * To add a new podcast or episode:
 *   1. Drop the transcript into the corpus.
 *   2. Author a Mission file under `content/missions/` with full
 *      {summary, concepts, evidence with timestamps, rubric questions}.
 *   3. Add `podcastId` and import / export below.
 *
 * Sorted newest first — matches podcast-feed convention.
 */
export const ALL_MISSIONS: Mission[] = [
  // Interview / deep-dive
  schmidtRoboticsEnergy,
  daraRobotaxi,
  daraQA,
  benLammColossal,
  sinclairLongevityPill,
  sinclairGLP1AI,
  // News roundups (WTF Just Happened in Tech)
  elonTerafab,
  spacexIPO,
  muskVsAltman,
  altmanAttackOpus,
  cursorSaasKills,
  google40bAnthropic,
  demisAgiRobots,
  googleRecordQuarter,
  anthropicSpacex,
  googleIoKarpathyCerebras,
  spacex75bIpoGpt55Erdos,
  organizationalSingularity,
].sort((a, b) => b.releasedDate.localeCompare(a.releasedDate));

export const MISSION_BY_ID: Record<string, Mission> = Object.fromEntries(
  ALL_MISSIONS.map((m) => [m.id, m])
);

/** Missions for a given theme/branch, in podcast-feed order (newest first). */
export function missionsForBranch(branch: string) {
  return ALL_MISSIONS.filter((m) => m.branch === branch);
}

/** Missions for a given podcast, in podcast-feed order. */
export function missionsForPodcast(podcastId: string) {
  return ALL_MISSIONS.filter((m) => m.podcastId === podcastId);
}
