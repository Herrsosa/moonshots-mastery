import { NextResponse } from "next/server";
import type { QuestionTemplate } from "@/lib/types";
import { scoreAnswerHeuristic, type AnswerScore } from "@/lib/scoring";

export const runtime = "nodejs";

interface ScoreReq {
  question: QuestionTemplate;
  answer: string;
  /** Episode title — helps the LLM judge specificity in context. */
  episodeTitle?: string;
}

/**
 * POST /api/check/score
 *
 * Grades a free-text answer to a mastery-check question against its rubric
 * using OpenAI structured output. Falls back to the deterministic heuristic
 * if the API key is missing or the call fails — so the app keeps working
 * offline or before the key is wired.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as ScoreReq;
  const { question, answer, episodeTitle } = body ?? {};
  if (!question || typeof answer !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const score = scoreAnswerHeuristic(question, answer);
    return NextResponse.json({ score, source: "heuristic-no-key" });
  }

  try {
    const score = await scoreWithOpenAI(question, answer, episodeTitle, key);
    return NextResponse.json({ score, source: "openai" });
  } catch (err) {
    console.error("[score] OpenAI call failed, falling back to heuristic:", err);
    const score = scoreAnswerHeuristic(question, answer);
    return NextResponse.json({ score, source: "heuristic-fallback" });
  }
}

async function scoreWithOpenAI(
  q: QuestionTemplate,
  answer: string,
  episodeTitle: string | undefined,
  apiKey: string,
): Promise<AnswerScore> {
  const sys = `You are a fair, encouraging oral-exam grader for a podcast mastery app. Your job is to recognize when a learner has clearly absorbed the episode, even if their phrasing isn't perfect.

GRADING SCALE — use these as concrete anchors:

95-100 (Master) — Nails the central point, includes the key specifics (numbers, names, mechanisms), AND adds genuine insight, synthesis, or application beyond what's in the rubric.

85-94 (Expert) — Clearly understood the topic. Hits the main rubric points correctly. Demonstrates real comprehension. Maybe missing one nuance or specific number — but you can tell they got it. THIS IS WHERE MOST GOOD ANSWERS LIVE — do not be stingy.

70-84 (Apprentice) — Directionally right. Covers the central idea. Missing a major rubric point OR is too thin to demonstrate full understanding. Solid effort but incomplete.

50-69 (Developing) — Partial credit. Touches the concept but misses key mechanisms or facts. Some right ideas mixed with vague generalities.

Below 50 — Either off-topic, fundamentally wrong, or so shallow it doesn't show understanding.

CRITICAL CALIBRATION RULES:
- DEFAULT TO GENEROUS when the learner clearly understood the core idea. A short answer that captures the central insight should easily score 85+, not 70.
- Do NOT punish brevity. A 1-sentence answer that nails the point can score higher than a 5-sentence one that wanders.
- Do NOT require the learner to repeat every rubric bullet — the rubric is what a model answer would cover, not a checklist they must recite.
- Numbers can be approximate (e.g. "around $70B" when the real number is $75B is FINE).
- Causal reasoning is bonus, not table-stakes. If they said WHY something is true, reward it. If they just stated WHAT is true correctly, that's still 80+.
- Penalize only: factually wrong claims, missing the central point entirely, or pure restatement of the question with no content.

Always respond with strict JSON matching the schema — no prose, no markdown.`;

  const user = {
    episodeTitle: episodeTitle ?? "",
    questionKind: q.kind,
    questionPrompt: q.prompt,
    rubricBullets: q.rubric,
    learnerAnswer: answer,
    scoringInstructions: {
      correctness: "0-100. Fraction of rubric bullets meaningfully covered, weighted by importance.",
      specificity: "0-100. Concrete names/numbers/dates/quotes vs generic statements.",
      depth: "0-100. Causal reasoning, framework use, not just listing facts.",
      application:
        q.kind === "applied" || q.kind === "synthesis" || q.kind === "pitch"
          ? "0-100. How well the answer APPLIES the concept to new situations or synthesizes across ideas."
          : "0-100. For recall, set roughly equal to correctness.",
      overall: "Use the GRADING SCALE anchors from the system prompt to set this directly — DO NOT compute a weighted formula. If the answer hits the central rubric point clearly, score 85+. Reserve 70s for partial answers. Reserve below 60 for clearly weak ones. Be GENEROUS when the learner demonstrably understood — this is the score the user sees.",
      feedback: "2-3 sentence specific coaching note for the end-of-quiz review. Reference what the learner actually said — never use formulaic openers like 'Great answer' or 'Quick honest take' or 'It seems like'. Be concrete: name the specific reasoning move that landed, and the specific one that didn't.",
      missedConcepts: "Array of rubric bullets (verbatim) the learner did not adequately cover. Empty if none.",
    },
  };

  const payload = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system" as const, content: sys },
      { role: "user" as const, content: JSON.stringify(user) },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("No content in OpenAI response");

  const parsed = JSON.parse(content);
  return normalize(parsed, q);
}

function normalize(raw: any, q: QuestionTemplate): AnswerScore {
  const clamp = (n: any) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const correctness = clamp(raw.correctness);
  const specificity = clamp(raw.specificity);
  const depth = clamp(raw.depth);
  const application = clamp(raw.application);
  // Prefer the model's holistic overall (anchored to the grading scale).
  // Formula is only a safety net if the field is missing.
  const overall = raw.overall != null
    ? clamp(raw.overall)
    : Math.round(correctness * 0.55 + specificity * 0.10 + depth * 0.20 + application * 0.15);
  const feedback = typeof raw.feedback === "string" ? raw.feedback : "";
  const missedConcepts: string[] = Array.isArray(raw.missedConcepts)
    ? raw.missedConcepts.filter((s: any) => typeof s === "string")
    : [];
  // If the model returned shortened versions, snap to verbatim rubric bullets where possible.
  const snapped = missedConcepts.map((m) => {
    const exact = q.rubric.find((r) => r === m);
    if (exact) return exact;
    const fuzzy = q.rubric.find((r) => r.toLowerCase().includes(m.toLowerCase().slice(0, 12)));
    return fuzzy ?? m;
  });
  return { correctness, specificity, depth, application, overall, feedback, missedConcepts: snapped };
}
