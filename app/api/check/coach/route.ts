import type { QuestionTemplate } from "@/lib/types";

export const runtime = "nodejs";

interface CoachReq {
  question: QuestionTemplate;
  answer: string;
  episodeTitle?: string;
}

/**
 * POST /api/check/coach
 *
 * Streams a 2-3 sentence coaching note token-by-token. Called in parallel with
 * the structured /api/check/score endpoint — the client shows tokens as they
 * arrive (perceived latency ~250ms instead of waiting 1.5-2s for the full JSON).
 *
 * Format: plain text streamed over chunked transfer encoding. If no key, returns
 * a single-shot templated fallback so the UI always renders something.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as CoachReq;
  const { question, answer, episodeTitle } = body ?? {};
  if (!question || typeof answer !== "string") {
    return new Response("Invalid payload", { status: 400 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return new Response("Thinking about your answer…", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Rotate the response style each call. This is the single biggest variety lever
  // — without it, gpt-4o-mini settles into one phrasing groove ("Quick honest take —
  // you might have missed…") within the first few calls of a session.
  const STYLES = [
    "Lead with a sharp specific observation about ONE thing they said. No opener phrase. Then pivot to what's missing.",
    "Open with a probing question — make THEM articulate the gap. Don't tell them the answer.",
    "Cut straight to the weakest claim in their answer. Be direct. No softening preamble.",
    "Quote a 3-6 word fragment from their answer and react to it. Make it feel like you read closely.",
    "Reframe what they said in your own words to show you got the gist — then push on the part they skipped.",
    "Compare what they offered to what the episode actually argued. Name the delta concretely.",
    "Affirm a non-obvious move they made, even if the answer was thin — then sharpen the focus.",
    "If their answer is strong, deepen it with a follow-on implication. If weak, name the missing mechanism.",
  ];
  const style = STYLES[Math.floor(Math.random() * STYLES.length)];

  const sys = `You are a sharp oral-exam coach in a podcast mastery app — like a brilliant friend who actually listened to the episode and is pushing your thinking.

GROUND RULES — these never change:
- 2-3 sentences. Conversational, not academic.
- NO formulaic openers. Never say "Quick honest take," "Solid start," "Great answer," "Strong response," or any variant. Never open with "It seems like."
- NO bullets, no JSON, no headers.
- You can be warm OR sharp depending on the answer quality — but never bland.
- Reference something SPECIFIC the learner said. Generic reactions are forbidden.

STYLE FOR THIS RESPONSE: ${style}`;

  const user = `EPISODE: ${episodeTitle ?? ""}
QUESTION (${question.kind}): ${question.prompt}

WHAT THE EPISODE ACTUALLY ARGUES (rubric):
${question.rubric.map((r, i) => `${i + 1}. ${r}`).join("\n")}

LEARNER'S ANSWER:
"${answer}"

Now write your reaction in the style specified above.`;

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      // Higher temperature + random style rotation = real variety across turns.
      temperature: 0.85,
      top_p: 0.95,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      stream: true,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const txt = await upstream.text().catch(() => "");
    console.error("[coach] upstream error", upstream.status, txt.slice(0, 200));
    return new Response("Hmm — let me think on that one.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Transform OpenAI's SSE chunks into plain text deltas for the client.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          // SSE messages are separated by blank lines, each starting with "data: ".
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") { controller.close(); return; }
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch { /* ignore malformed lines */ }
          }
        }
        controller.close();
      } catch (err) {
        console.error("[coach] stream error", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
