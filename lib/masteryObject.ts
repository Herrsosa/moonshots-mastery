import type { Mission } from "./types";

/**
 * Turns a mission into a "mastery object" — the structured learning hierarchy
 * the detail page leads with, instead of dumping a long summary. Everything is
 * derived deterministically from existing mission fields, so it works for all
 * episodes with no extra authoring.
 */
export interface MasteryObject {
  thesis: string;            // the episode's core argument, one line
  ideas: string[];           // 3–5 concise ideas/claims to master
  kpis: string[];            // key numbers/KPIs pulled from the summary
  people: string[];          // guests / voices
}

/** First sentence of the summary — the episode's thesis. */
function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s|$)/);
  const s = (m ? m[0] : text).trim();
  return s.length > 220 ? s.slice(0, 217).trimEnd() + "…" : s;
}

/**
 * Extract distinct quantitative phrases (a number + its unit/noun tail) from the
 * summary. Deliberately conservative — better to show 4 clean KPIs than 12 noisy
 * fragments.
 */
function extractKpis(summary: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  // number (with $, %, x, or magnitude words) + up to 3 trailing words
  const re =
    /(\$?\d[\d.,]*\s?(?:trillion|billion|million|quadrillion|GW|TW|terawatts?|gigawatts?|%|x|B|T|M|TPUs?|GPUs?)?)(\s+[A-Za-z][\w/-]*(?:\s+[A-Za-z][\w/-]*){0,2})?/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(summary)) && out.length < 8) {
    const num = match[1].trim();
    // Skip bare small integers with no unit/tail (e.g. "3 ways") — low signal.
    const hasUnit = /[$%xBTM]|trillion|billion|million|quadrillion|GW|TW|watt|TPU|GPU/i.test(num);
    if (!hasUnit) continue;
    const tail = (match[2] ?? "").trim().replace(/[.,;:]$/, "");
    const phrase = (tail ? `${num} ${tail}` : num).trim();
    const key = phrase.toLowerCase();
    if (seen.has(key) || phrase.length < 2) continue;
    seen.add(key);
    out.push(phrase);
  }
  return out.slice(0, 6);
}

export function buildMasteryObject(m: Mission): MasteryObject {
  return {
    thesis: firstSentence(m.summary),
    // Concept labels are already concise, episode-specific claims to master.
    ideas: m.concepts.slice(0, 5).map((c) => c.label),
    kpis: extractKpis(m.summary),
    people: m.guests,
  };
}
