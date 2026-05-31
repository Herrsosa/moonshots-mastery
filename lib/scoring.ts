import type { QuestionTemplate } from "./types";

export interface AnswerScore {
  correctness: number;   // 0..100
  specificity: number;
  depth: number;
  application: number;
  overall: number;       // weighted
  feedback: string;
  missedConcepts: string[];
}

/**
 * Mock scorer — heuristically grades a free-text answer against a rubric.
 * Swap this with an OpenAI route handler once OPENAI_API_KEY is provided.
 *
 * Heuristic: for each rubric bullet, look for any of the meaningful tokens
 * in the user's answer. The fraction of bullets hit drives "correctness".
 * Length + variety drives specificity / depth.
 */
export function scoreAnswerHeuristic(q: QuestionTemplate, answer: string): AnswerScore {
  const text = answer.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  const hits: string[] = [];
  const misses: string[] = [];
  for (const bullet of q.rubric) {
    const tokens = bullet
      .toLowerCase()
      .replace(/[(),.;:!?'"`/\\]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 4 && !STOP.has(t));
    const matched = tokens.some((t) => text.includes(t));
    if (matched) hits.push(bullet);
    else misses.push(bullet);
  }
  const correctness = Math.round((hits.length / Math.max(1, q.rubric.length)) * 100);

  const lengthScore = Math.min(100, Math.round((words.length / 60) * 100));
  const uniqueRatio = new Set(words).size / Math.max(1, words.length);
  const specificity = Math.min(100, Math.round(lengthScore * 0.6 + uniqueRatio * 70));
  const depth       = Math.min(100, Math.round(correctness * 0.7 + lengthScore * 0.4));
  const application = q.kind === "applied" || q.kind === "synthesis" || q.kind === "pitch"
    ? Math.min(100, Math.round(correctness * 0.8 + depth * 0.3))
    : Math.min(100, Math.round(correctness * 0.9));

  const overall = Math.round(
    correctness * 0.45 + specificity * 0.15 + depth * 0.2 + application * 0.2
  );

  const feedback = buildFeedback(q, hits, misses, overall);

  return {
    correctness, specificity, depth, application, overall,
    feedback,
    missedConcepts: misses,
  };
}

function buildFeedback(q: QuestionTemplate, hits: string[], misses: string[], overall: number): string {
  if (overall >= 85) {
    return `Strong answer — you covered ${hits.length}/${q.rubric.length} rubric points. ${misses.length ? `Worth tightening: ${misses[0]}.` : "Nothing material to add."}`;
  }
  if (overall >= 60) {
    return `Solid but partial — you got ${hits.length}/${q.rubric.length} rubric points. Push on: ${misses.slice(0, 2).join("; ")}.`;
  }
  if (overall >= 35) {
    return `Directionally right but thin. Add specificity around: ${misses.slice(0, 2).join("; ")}.`;
  }
  return `Re-listen to the relevant segment. Key things to grab: ${misses.slice(0, 3).join("; ")}.`;
}

const STOP = new Set([
  "the","and","for","with","this","that","from","into","over","more","much","very","they","them","their","there","what","when","whom","whose","which","while","also","just","than","then","have","been","were","will","would","could","should","about","because","across","within","before","after","under","upon","onto","still","like","such","some","many","most","only","make","makes","made","keep","give","gets","goes","go","via","not"
]);
