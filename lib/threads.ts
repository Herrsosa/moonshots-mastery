import type { Mission } from "./types";

/**
 * Thread intelligence — the "what changed over time" layer.
 *
 * Moonshots episodes are weekly multi-topic discussions, so bucketing them into
 * static categories is misleading. Instead we track a fixed set of long-running
 * THREADS (Anthropic, compute/power, SpaceX, …) and detect which threads each
 * episode touches via deterministic keyword matching over the mission's own
 * fields. This lets the timeline show how the feed's worldview evolves rather
 * than freezing episodes into one category.
 *
 * Everything here is pure + deterministic — no LLM, no network.
 */

export interface Thread {
  id: string;
  label: string;
  /** Hex accent used for the chip + evolution view. */
  color: string;
  /** Lowercased keyword fragments; a match in title/summary/concepts tags the episode. */
  patterns: string[];
}

export const THREADS: Thread[] = [
  { id: "anthropic",  label: "Anthropic",      color: "#D97706", patterns: ["anthropic", "claude", "dario", "amodei"] },
  { id: "ai-usage",   label: "AI usage / tokens", color: "#22D3EE", patterns: ["token", "tokens/month", "tokens per", "quadrillion", "arr", "usage", "inference demand"] },
  { id: "compute",    label: "Compute & power", color: "#F59E0B", patterns: ["compute", "data center", "data centre", "gigawatt", " gw", "power", "energy", "grid", "nuclear", "cerebras", "wafer", "tpu", "gpu", "fab", "terafab", "dyson"] },
  { id: "spacex",     label: "SpaceX",         color: "#818CF8", patterns: ["spacex", "starship", "starlink", "falcon", "musk", "elon", "raptor", "orbital", "launch"] },
  { id: "google",     label: "Google",        color: "#60A5FA", patterns: ["google", "gemini", "deepmind", "sundar", "demis", "alphabet", "android", "i/o", "anti-gravity"] },
  { id: "models",     label: "Model progress", color: "#A855F7", patterns: ["gpt", "opus", "model", "frontier", "benchmark", "reasoning", "parameter", "multimodal", "agi", "superintelligence", "karpathy"] },
  { id: "robotics",   label: "Humanoids & robotics", color: "#2DD4BF", patterns: ["humanoid", "robot", "optimus", "figure", "1x", "neo", "robotaxi", "waymo", "autonomous"] },
  { id: "longevity",  label: "Longevity & bio", color: "#22C55E", patterns: ["longevity", "sinclair", "glp", "aging", "ageing", "biotech", "colossal", "gene", "cancer", "dementia", "egg", "species"] },
  { id: "markets",    label: "Markets & capital", color: "#F472B6", patterns: ["ipo", "valuation", "raise", "billion", "trillion", "market cap", "fund", "vc", "capital", "acquire", "revenue", "economy", "tax"] },
];

export const THREAD_BY_ID: Record<string, Thread> = Object.fromEntries(THREADS.map((t) => [t.id, t]));

/**
 * Curated one-line "what changed" notes, keyed by missionId → threadId.
 * Optional — only the highest-signal shifts are filled in. The timeline shows
 * these when present; absence is fine.
 */
const WHAT_CHANGED: Record<string, Record<string, string>> = {
  "anthropic-spacex": {
    anthropic: "Anthropic shifts from fast-growing lab to SpaceX-backed compute buyer.",
    compute: "Compute supply becomes the binding constraint on frontier AI.",
  },
  "google-io-karpathy-cerebras": {
    google: "Google tokens/month (3.2 quadrillion) becomes the headline AI-scale KPI.",
    anthropic: "Karpathy joins Anthropic — top talent consolidates into two labs.",
    compute: "Cerebras' $95B IPO marks wafer-scale as a credible inference moat.",
  },
  "spacex-75b-ipo-gpt55-erdos": {
    spacex: "SpaceX narrative shifts from launch economics to AI-infrastructure platform.",
    models: "AI cracks an 80-year-old Erdős problem — first real creative-math win.",
    markets: "SpaceX's $75B raise reframes capital as the scarce input, not ideas.",
  },
  "organizational-singularity": {
    markets: "The firm itself is reframed as a fiduciary shell around AI workflows.",
  },
  "demis-agi-robots": {
    robotics: "Humanoid production cadence (1/day → 1/hour) enters the conversation.",
    models: "Demis: AGI may need no further breakthrough — just scaling + reasoning.",
  },
  "musk-vs-altman": {
    markets: "OpenAI's $852B raise sets the pace for the IPO-window land grab.",
  },
  "vatican-ai-layoffs-moon": {
    models: "The fight shifts from capability to anthropology — what AI IS, not just what it does.",
    anthropic: "Anthropic projected to pass Alphabet's revenue by 2028 — lab becomes hyperscaler-scale.",
    spacex: "Starlink extends to gigabit lunar links — the interplanetary internet begins.",
  },
  "opus48-openai-foundation-agi2029": {
    anthropic: "Opus 4.8 retakes the coding crown — the lead now flips on a ~6-week cadence.",
    models: "Benchmarks saturate; the frontier pivots to unsolved problems and a 2029 AGI debate.",
    markets: "OpenAI's nonprofit foundation (~$220B) becomes the largest on Earth — and the UBI backstop question.",
    "ai-usage": "Token prices keep collapsing as cognition goes abundant; tokens stop being the right unit.",
  },
};

/**
 * Returns the thread metas an episode touches, ordered by THREADS order.
 * Matches against short+long title, summary, and concept labels.
 */
export function threadsForMission(m: Mission): Thread[] {
  const haystack = [
    m.episodeTitle,
    m.episodeShortTitle,
    m.summary,
    ...m.concepts.map((c) => c.label),
  ]
    .join("  ")
    .toLowerCase();

  return THREADS.filter((t) => t.patterns.some((p) => haystack.includes(p)));
}

/** The curated "what changed" line for a mission+thread, if one exists. */
export function whatChanged(missionId: string, threadId: string): string | undefined {
  return WHAT_CHANGED[missionId]?.[threadId];
}

/** All curated "what changed" notes for a mission (any thread). */
export function missionChanges(missionId: string): { threadId: string; text: string }[] {
  const map = WHAT_CHANGED[missionId];
  if (!map) return [];
  return Object.entries(map).map(([threadId, text]) => ({ threadId, text }));
}

/**
 * Chronological list (oldest → newest) of episodes that touch a thread — the
 * backbone of a future "show evolution" view.
 */
export function threadEvolution(threadId: string, missions: Mission[]): Mission[] {
  const t = THREAD_BY_ID[threadId];
  if (!t) return [];
  return missions
    .filter((m) => threadsForMission(m).some((x) => x.id === threadId))
    .sort((a, b) => a.releasedDate.localeCompare(b.releasedDate));
}
