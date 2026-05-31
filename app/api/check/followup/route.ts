import { NextResponse } from "next/server";
import type { QuestionTemplate } from "@/lib/types";

export const runtime = "nodejs";

interface FollowupReq {
  question: QuestionTemplate;
  answer: string;
  missedConcepts: string[];
  episodeTitle?: string;
}

/**
 * POST /api/check/followup
 *
 * Generates ONE short Socratic follow-up that probes the weakest rubric point.
 * Returns { followup: string }. If no key or call fails, returns a templated
 * fallback so the UX still flows.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as FollowupReq;
  const { question, answer, missedConcepts, episodeTitle } = body ?? {};
  if (!question) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  const target = missedConcepts?.[0] ?? question.rubric[0] ?? "";

  if (!key) {
    return NextResponse.json({ followup: templatedFollowup(target), source: "templated" });
  }

  try {
    const followup = await askOpenAI(question, answer, target, episodeTitle, key);
    return NextResponse.json({ followup, source: "openai" });
  } catch (err) {
    console.error("[followup] OpenAI failed, using templated:", err);
    return NextResponse.json({ followup: templatedFollowup(target), source: "templated-fallback" });
  }
}

function templatedFollowup(target: string): string {
  if (!target) return "Can you push a level deeper on the part you skipped over?";
  return `One thing you didn't address: "${target}". Walk me through that specifically.`;
}

async function askOpenAI(
  q: QuestionTemplate,
  answer: string,
  target: string,
  episodeTitle: string | undefined,
  apiKey: string,
): Promise<string> {
  const sys = `You are a Socratic tutor in a podcast mastery oral exam.
The learner answered a question but missed an important point. Ask ONE short follow-up question
(under 30 words) that probes the missed point WITHOUT giving away the answer.
Be conversational. No preamble like "Great answer, but…" — just ask.
Respond with strict JSON: {"followup": "<your question>"}`;

  const user = {
    episodeTitle: episodeTitle ?? "",
    originalQuestion: q.prompt,
    learnerAnswer: answer,
    missedPoint: target,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: JSON.stringify(user) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);
  if (typeof parsed?.followup !== "string") throw new Error("No followup string");
  return parsed.followup;
}
