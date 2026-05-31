export type Branch =
  | "ai"
  | "robotics"
  | "longevity"
  | "energy"
  | "space"
  | "biotech"
  | "markets"
  | "abundance";

/** Status reflects coverage, not gating. No "locked" — every mission is reachable. */
export type NodeStatus = "available" | "in_progress" | "mastered";

export interface TreeNode {
  id: Branch;
  label: string;
  iconKey: "brain" | "robot" | "dna" | "bolt" | "rocket" | "leaf" | "chart" | "user";
  /** position in unit-space (0..1) — laid out by TechTree */
  x: number;
  y: number;
  /** parents in the graph */
  parents: Branch[];
  glowColor: "purple" | "cyan" | "green" | "amber" | "gray";
}

export interface QuestionTemplate {
  id: string;
  kind: "recall" | "applied" | "synthesis" | "pitch";
  prompt: string;
  rubric: string[];
  concepts: string[];
}

export interface EvidenceQuote {
  speaker: string;
  quote: string;
  tStart: string; // "MM:SS" — used to build YouTube deep link
}

export interface Mission {
  id: string;
  /** Which podcast this episode comes from (e.g. "moonshots"). */
  podcastId: string;
  branch: Branch;
  episodeTitle: string;
  episodeShortTitle: string;
  /** Show numbers (e.g. 207) prominently on the map so users can match the app to the source feed. */
  episodeNumber?: number | string;
  guests: string[];
  /** ISO YYYY-MM-DD. Used for chronological sort across the app. */
  releasedDate: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  /** YouTube video ID — used to deep-link evidence quotes */
  videoId?: string;
  concepts: { id: string; label: string; color?: "cyan" | "purple" | "amber" | "green" }[];
  evidence: EvidenceQuote[];
  questions: QuestionTemplate[];
  badge: { id: string; name: string; iconKey: string; rarity: "common" | "rare" | "epic" | "legendary" };
  xp: number;
}

export interface MissionAttempt {
  score: number;
  weakConcepts: string[];
  perQuestion: { qid: string; score: number; feedback: string }[];
  attempts: number;
  completedAt?: string;
  /** Spaced-repetition stage (index into REVIEW_INTERVALS_DAYS). Optional for
   *  backward-compat with attempts persisted before SR existed. */
  reviewStage?: number;
  /** ISO timestamp when this mission next surfaces for review. */
  reviewDue?: string;
}

export interface UserState {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  lastActive: string;
  missions: Record<string, MissionAttempt>;
  badges: string[];
}
