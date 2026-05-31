import { NextResponse } from "next/server";
import type { Mission } from "@/lib/types";

export const runtime = "nodejs";

interface QuestionReq {
  mission: Pick<Mission, "episodeTitle" | "episodeShortTitle" | "summary" | "concepts" | "questions">;
  /** Previous Q&A turns in this session, oldest first. */
  history: { question: string; answer: string }[];
  /** 1-indexed position of the question we're generating. */
  questionNumber: number;
  /** Total questions in the planned check (informs pacing — broader earlier, sharper later). */
  totalQuestions: number;
  /** Concept IDs already probed in prior turns — avoid repeating. */
  probedConceptIds: string[];
}

export interface GeneratedQuestion {
  /** The question to display to the learner. */
  prompt: string;
  /** "applied" | "synthesis" | "pitch" — drives the question-kind label. */
  kind: "applied" | "synthesis" | "pitch";
  /** Concept IDs (from mission.concepts) this question targets. */
  targetConceptIds: string[];
  /** Rubric points — what a good answer would cover. Used by the scorer. */
  rubric: string[];
}

/**
 * POST /api/check/question
 *
 * Generates the next quiz question for this session in light of the conversation
 * so far. Keeps coverage (won't repeat already-probed concepts) but phrases the
 * question conversationally and adapts to what the learner has already said.
 *
 * Falls back to the next un-probed seed question from mission.questions if the
 * API key is missing or generation fails — so the flow always advances.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as QuestionReq;
  const { mission, history, questionNumber, totalQuestions, probedConceptIds } = body ?? {};
  if (!mission) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ question: fallbackQuestion(mission, probedConceptIds), source: "fallback-no-key" });
  }

  try {
    const generated = await generate(mission, history, questionNumber, totalQuestions, probedConceptIds, key);
    return NextResponse.json({ question: generated, source: "openai" });
  } catch (err) {
    console.error("[question] OpenAI failed, using fallback:", err);
    return NextResponse.json({ question: fallbackQuestion(mission, probedConceptIds), source: "fallback-error" });
  }
}

function fallbackQuestion(mission: QuestionReq["mission"], probedIds: string[]): GeneratedQuestion {
  // Find the next mission.questions entry whose concepts aren't all probed yet.
  const deeper = mission.questions.filter((q) => q.kind !== "recall");
  const seed = deeper.find((q) => !q.concepts.every((c) => probedIds.includes(c))) ?? deeper[0] ?? mission.questions[0];
  return {
    prompt: seed.prompt,
    kind: (seed.kind === "recall" ? "applied" : seed.kind) as GeneratedQuestion["kind"],
    targetConceptIds: seed.concepts,
    rubric: seed.rubric,
  };
}

async function generate(
  mission: QuestionReq["mission"],
  history: QuestionReq["history"],
  questionNumber: number,
  totalQuestions: number,
  probedIds: string[],
  apiKey: string,
): Promise<GeneratedQuestion> {
  const remainingConcepts = mission.concepts.filter((c) => !probedIds.includes(c.id));
  const pacing =
    questionNumber === 1
      ? "Opening question. Pick the most important concept and probe it head-on."
      : questionNumber >= totalQuestions
        ? "Final question. Force synthesis — connect 2+ concepts or push to implications."
        : history.length > 0
          ? "Mid-quiz. React to what they just said. Either go deeper on the same concept they fumbled, OR pivot to a related un-probed concept."
          : "Mid-quiz. Pick a fresh concept and ask an applied or synthesis question.";

  const sys = `You are a sharp oral-exam interviewer for a podcast mastery app. Your job: ask ONE question that tests whether the learner ACTUALLY ABSORBED THE SPECIFIC FACTS DISCUSSED IN THIS EPISODE.

CORE RULES:
- Ask exactly ONE question. Conversational, not academic. 25-50 words max.
- Pick targetConceptIds STRICTLY from the "remainingConcepts" list. NEVER pick a concept id from "probedConceptIds" — those have already been covered.
- Build rubric: 3-5 bullet points of what a good answer must cover, written tersely. Used to grade the answer.

DIVERSITY RULE — STRICTLY ENFORCED:
- If "remainingConcepts" is non-empty, you MUST pick at least one id from it that is NOT in "probedConceptIds".
- DO NOT keep asking about the same topic from one question to the next. Each question MUST move to a new concept.
- If the previous question covered, e.g., Cerebras' wafer-scale architecture, do NOT ask another Cerebras question — pivot to a completely different concept from remainingConcepts.

ATTRIBUTION RULES — these prevent embarrassing self-talk:
- The "conversationSoFar" array contains BOTH your previous questions AND the learner's answers. Only the "answer" field is what the LEARNER said. The "question" field is what YOU said.
- DO NOT say "you mentioned X" or "as you said" or "earlier you brought up X" unless X actually appears in one of the learner's answer fields — NOT in your own question fields.
- DO NOT use words like "earlier", "before", "previously", or "we discussed" when referring to the IMMEDIATELY preceding turn. That's not "earlier", it's just now. Move on to a new topic instead.

QUESTION STYLE:

✅ GOOD questions reference specific things from the episode:
- A specific number, name, dollar figure, date, or quote that appeared
- A specific claim a guest made
- A specific company action, deal, framework, or moment
- "Walk me through X" / "Why did Y do Z" / "Apply A to the case of B from the episode"
- Pattern: the question is UNANSWERABLE without having heard this specific episode

❌ BAD questions are generic philosophical drift. NEVER write questions like:
- "How will X influence Y moving forward?"
- "What are the implications of X for Y?"
- "In the context of Z, how does X impact Y?"
- "How might X shape industry norms?"
- "What does X mean for the future of Y?"

If your draft contains "moving forward", "going forward", "in the context of", "implications for", "shape the future of", DELETE and rewrite concretely.

GROUNDING RULES:
- Re-read episodeSummary before phrasing. Every entity, product, claim, or number in your question MUST appear there or in allConcepts.
- DO NOT invent competitive/oppositional relationships. If Product X is made by Company Y, NEVER ask how Y "competes with" X.
- DO NOT introduce people, products, or numbers not named in the summary.

Respond with strict JSON only — no prose, no markdown.
Shape: { "prompt": string, "kind": "applied"|"synthesis"|"pitch", "targetConceptIds": string[], "rubric": string[] }`;

  // Surface the hand-authored seed rubrics as "exemplar question patterns" so the
  // model sees how concepts have been probed before — concrete grounding beats
  // bare concept labels at preventing hallucinated relationships.
  const exemplarPatterns = mission.questions
    .filter((q) => q.kind !== "recall")
    .slice(0, 5)
    .map((q) => ({ prompt: q.prompt, conceptIds: q.concepts }));

  const baseUserPayload = {
    episodeTitle: mission.episodeTitle,
    episodeShortTitle: mission.episodeShortTitle,
    episodeSummary: mission.summary,
    allConcepts: mission.concepts.map((c) => ({ id: c.id, label: c.label })),
    remainingConcepts: remainingConcepts.map((c) => ({ id: c.id, label: c.label })),
    probedConceptIds: probedIds,
    exemplarPatterns,
    pacing,
    questionNumber,
    totalQuestions,
    conversationSoFar: history,
    reminder: "Re-read episodeSummary. Only mention entities that appear in episodeSummary or allConcepts. Target a concept from remainingConcepts only.",
  };

  const probedSet = new Set(probedIds);
  const validIds = new Set(mission.concepts.map((c) => c.id));
  const remainingIds = new Set(remainingConcepts.map((c) => c.id));

  // Try once normally, then up to 2 retries with progressively stricter scolding
  // if the model picks an already-probed concept. After that, hard-fall-back.
  for (let attempt = 0; attempt < 3; attempt++) {
    const userPayload = attempt === 0
      ? baseUserPayload
      : {
          ...baseUserPayload,
          // Stronger admonition on retry — the model's previous choice broke the diversity rule.
          reminder:
            `RETRY ${attempt}: your previous attempt re-probed an already-covered concept. ` +
            `You MUST target a concept whose id is in remainingConcepts (${remainingConcepts.map((c) => c.id).join(", ") || "EMPTY"}). ` +
            `Pivot completely away from previously-probed concepts: ${probedIds.join(", ")}.`,
        };

    let parsed: any;
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          // 0.5 keeps enough variety across sessions without fabricating relationships.
          temperature: 0.5,
          top_p: 0.9,
          presence_penalty: 0.2,
          response_format: { type: "json_object" as const },
          messages: [
            { role: "system" as const, content: sys },
            { role: "user" as const, content: JSON.stringify(userPayload) },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content;
      if (typeof content !== "string") throw new Error("No content");
      parsed = JSON.parse(content);
    } catch (err) {
      if (attempt === 2) throw err;
      continue;
    }

    const candidateIds: string[] = Array.isArray(parsed?.targetConceptIds)
      ? parsed.targetConceptIds.filter((id: any) => typeof id === "string" && validIds.has(id))
      : [];
    const rubric: string[] = Array.isArray(parsed?.rubric)
      ? parsed.rubric.filter((r: any) => typeof r === "string")
      : [];
    const kind = ["applied", "synthesis", "pitch"].includes(parsed?.kind) ? parsed.kind : "applied";
    const prompt = typeof parsed?.prompt === "string" && parsed.prompt.length > 0 ? parsed.prompt : null;

    if (!prompt || rubric.length === 0) {
      if (attempt === 2) break;
      continue;
    }

    // Diversity check: if remainingConcepts is non-empty, at least one targetConceptId
    // must come from it. Otherwise it's a re-probe — retry with stronger scolding.
    const hitsRemaining = candidateIds.some((id) => remainingIds.has(id));
    if (remainingConcepts.length > 0 && !hitsRemaining) {
      if (attempt < 2) continue;
      // Last attempt also failed — patch the targetConceptIds to a remaining one so
      // probedIds tracking stays accurate for the NEXT question.
      const forcedId = remainingConcepts[0].id;
      return { prompt, kind, targetConceptIds: [forcedId], rubric };
    }

    return { prompt, kind, targetConceptIds: candidateIds, rubric };
  }

  // Total failure — full hand-authored fallback that's guaranteed to be on a fresh concept.
  return fallbackQuestion(mission, probedIds);
}
