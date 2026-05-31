"use client";
import { Suspense, useEffect, useMemo, useRef, useState, use } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, User, ChevronLeft, Sparkles } from "lucide-react";
import { ALL_MISSIONS, MISSION_BY_ID } from "@/content/missions";
import { scoreAnswerHeuristic, type AnswerScore } from "@/lib/scoring";
import type { Mission, QuestionTemplate } from "@/lib/types";
import { useStore } from "@/lib/store";
import { AnswerInput } from "@/components/check/AnswerInput";
import { ScoreCard } from "@/components/check/ScoreCard";

/**
 * Mastery check — fluid conversational version.
 *
 * Each question is generated dynamically by /api/check/question in light of
 * the conversation so far. The mission's hand-authored questions act as a
 * fallback if the API is unavailable, but the default path is fully adaptive:
 *
 *   - Q1: opening question on the most important concept
 *   - Q2-N: each adapts to what the learner just said, picks a fresh concept
 *   - On weak answers: a Socratic follow-up question probes the missed point
 *
 * Coverage is maintained via a probedConceptIds set passed to the API.
 */

const TOTAL_QUESTIONS = 5;

interface Turn {
  /** Stable id for this turn — used for React keying and ScoreCard mapping. */
  qid: string;
  prompt: string;
  /** Question metadata generated alongside the prompt. Used for scoring. */
  kind?: "applied" | "synthesis" | "pitch";
  targetConceptIds?: string[];
  rubric?: string[];
  answer?: string;
  score?: AnswerScore;
  /** True while we're awaiting the API for THIS turn's question text. */
  loading?: boolean;
}

export default function MasteryCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={<div className="px-8 py-16 text-center text-ink-dim text-sm">Loading mastery check…</div>}
    >
      <CheckWithReset id={id} />
    </Suspense>
  );
}

function CheckWithReset({ id }: { id: string }) {
  const attemptParam = useSearchParams()?.get("attempt") ?? "1";
  return <CheckSession key={`${id}-${attemptParam}`} id={id} />;
}

function CheckSession({ id }: { id: string }) {
  const router = useRouter();
  const m = MISSION_BY_ID[id];
  const completeMission = useStore((s) => s.completeMission);
  const previousBest = useStore((s) => s.missions[id]?.score);
  const previousBestRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (previousBestRef.current === undefined) previousBestRef.current = previousBest;
  }, [previousBest]);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Concept IDs probed across this session — drives coverage in next-question generation. */
  const probedConceptIds = useRef<Set<string>>(new Set());
  /** Guard so React Strict Mode's double-mount doesn't fire Q1 twice. */
  const q1Started = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const nextMissionId = useMemo(() => {
    if (!m) return undefined;
    const sameBranch = ALL_MISSIONS.filter((x) => x.branch === m.branch && x.id !== m.id);
    if (sameBranch.length) return sameBranch[0].id;
    const i = ALL_MISSIONS.findIndex((x) => x.id === m.id);
    return i >= 0 && i < ALL_MISSIONS.length - 1 ? ALL_MISSIONS[i + 1].id : undefined;
  }, [m]);

  // Kick off Q1 once we have a mission and haven't started yet.
  useEffect(() => {
    if (!m || q1Started.current) return;
    q1Started.current = true;
    void fetchAndAppendQuestion(m, [], 1, probedConceptIds.current, setTurns);
  }, [m]);

  if (!m) return notFound();

  const idx = turns.length - 1;
  const primaryCount = turns.filter((t) => !t.loading).length;
  const primaryAnswered = turns.filter((t) => t.score).length;
  const currentTurnObj = turns[idx];

  async function submit() {
    if (!m || !currentTurnObj || currentTurnObj.loading) return;
    if (!currentTurnObj.rubric) return; // safety — no rubric, can't grade
    setSubmitting(true);
    const submittedAnswer = answer;
    setAnswer("");

    // No follow-ups in this version — every turn is a fresh primary question.
    // We keep the field-shape compatible with the prior layout in case we
    // bring follow-ups back behind a setting later.
    const gradingQ: QuestionTemplate = {
      id: currentTurnObj.qid,
      kind: (currentTurnObj.kind as any) ?? "applied",
      prompt: currentTurnObj.prompt,
      rubric: currentTurnObj.rubric ?? [],
      concepts: currentTurnObj.targetConceptIds ?? [],
    };

    // Mark probed concepts so the next question won't repeat them.
    for (const cid of currentTurnObj.targetConceptIds ?? []) probedConceptIds.current.add(cid);

    // Lock the answer immediately. No coach bubble, no streaming chat reaction —
    // the user goes straight to the next question. All feedback lands on the
    // ScoreCard at the end of the quiz.
    const turnIdx = idx;
    setTurns((prev) => {
      const copy = [...prev];
      copy[turnIdx] = { ...copy[turnIdx], answer: submittedAnswer };
      return copy;
    });

    // Score quietly in the background so the ScoreCard has per-question results
    // ready when the quiz finishes. The user never sees this score until the end.
    const score = await scoreAnswer(gradingQ, submittedAnswer, m.episodeTitle);
    setTurns((prev) => {
      const copy = [...prev];
      copy[turnIdx] = { ...copy[turnIdx], score };
      return copy;
    });

    // Decide: another primary question, or finalize?
    const newAnsweredCount = primaryAnswered + 1;
    if (newAnsweredCount < TOTAL_QUESTIONS) {
      await delay(250);
      const history = turns
        .filter((t) => t.answer)
        .map((t) => ({ question: t.prompt, answer: t.answer! }))
        .concat([{ question: currentTurnObj.prompt, answer: submittedAnswer }]);
      await fetchAndAppendQuestion(m, history, newAnsweredCount + 1, probedConceptIds.current, setTurns);
      setSubmitting(false);
      return;
    }

    // FINAL — aggregate and reveal the ScoreCard.
    const allTurns = turns.concat([{ ...currentTurnObj, answer: submittedAnswer, score }]).filter(
      (t, i, arr) => arr.findIndex((x) => x.qid === t.qid) === i,
    );
    finalizeScore(m, allTurns, completeMission, setDone);
    setSubmitting(false);
  }

  if (done) {
    const { finalScore, weak, perQuestion } = computeFinal(m, turns);
    return (
      <div className="px-4 md:px-8 py-10 max-w-3xl mx-auto">
        <ScoreCard
          mission={m}
          score={finalScore}
          weakConcepts={weak}
          xpGained={Math.round((m.xp * finalScore) / 100)}
          nextMissionId={nextMissionId}
          perQuestion={perQuestion}
          previousScore={previousBestRef.current}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto pb-32 md:pb-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-4">
        <ChevronLeft size={16} /> Exit mastery check
      </button>

      <div className="panel rounded-2xl px-5 py-4 mb-5 flex items-center gap-4">
        <div className="size-10 rounded-xl bg-cyan-500/15 ring-1 ring-cyan-400/30 grid place-items-center">
          <Sparkles size={16} className="text-cyan-200" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">Mastery Check</div>
          <div className="text-base font-bold text-ink truncate">{m.episodeShortTitle}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-ink-dim">Question</div>
          <div className="text-xl font-bold text-cyan-200 font-mono">
            {Math.min(primaryCount, TOTAL_QUESTIONS)}<span className="text-ink-faint text-sm">/{TOTAL_QUESTIONS}</span>
          </div>
        </div>
      </div>

      <div className="h-1 rounded-full bg-bg-line overflow-hidden mb-5">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${(primaryAnswered / TOTAL_QUESTIONS) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: "linear-gradient(90deg,#22D3EE,#A855F7)", boxShadow: "0 0 14px rgba(34,211,238,0.6)" }}
        />
      </div>

      <div ref={scrollRef} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <div key={t.qid} className="space-y-3">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5">
                <div className="size-8 rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30 grid place-items-center shrink-0">
                  <Bot size={14} className="text-cyan-200" />
                </div>
                <div className="panel-soft rounded-2xl rounded-tl-md px-4 py-3 max-w-[88%]">
                  <div className="text-[10px] uppercase tracking-widest text-cyan-300/80 mb-1">
                    {kindLabel(t.kind)}
                  </div>
                  {t.loading ? (
                    <p className="text-sm text-ink-dim italic flex items-center gap-1.5">
                      <Dot delay={0} /><Dot delay={0.15} /><Dot delay={0.3} />
                    </p>
                  ) : (
                    <p className="text-sm text-ink leading-relaxed">{t.prompt}</p>
                  )}
                </div>
              </motion.div>

              {t.answer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 flex-row-reverse">
                  <div className="size-8 rounded-lg bg-purple-500/15 ring-1 ring-purple-400/30 grid place-items-center shrink-0">
                    <User size={14} className="text-purple-200" />
                  </div>
                  <div className="rounded-2xl rounded-tr-md px-4 py-3 max-w-[88%] bg-purple-500/10 border border-purple-400/20">
                    <p className="text-sm text-ink leading-relaxed">{t.answer}</p>
                  </div>
                </motion.div>
              )}

              {/* Intentionally no per-turn AI reaction. Feedback lands on the
                  final ScoreCard so the quiz stays exactly 5 questions long. */}
            </div>
          ))}
          {submitting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5">
              <div className="size-8 rounded-lg bg-cyan-500/15 ring-1 ring-cyan-400/30 grid place-items-center shrink-0">
                <Bot size={14} className="text-cyan-200" />
              </div>
              <div className="panel-soft rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Dot delay={0} /><Dot delay={0.15} /><Dot delay={0.3} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4">
        {currentTurnObj?.loading ? (
          <div className="text-center text-xs text-ink-faint">Generating next question…</div>
        ) : currentTurnObj?.answer ? (
          <div className="text-center text-xs text-ink-faint">Moving on…</div>
        ) : (
          <AnswerInput value={answer} onChange={setAnswer} onSubmit={submit} disabled={submitting || !currentTurnObj?.rubric} />
        )}
      </div>
    </div>
  );
}

// ---------- Helpers ----------

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

/**
 * Fetch the next question and append it to the turn list. Adds a loading
 * placeholder first so the UI shows a typing indicator immediately.
 */
async function fetchAndAppendQuestion(
  mission: Mission,
  history: { question: string; answer: string }[],
  questionNumber: number,
  probedSet: Set<string>,
  setTurns: React.Dispatch<React.SetStateAction<Turn[]>>,
) {
  const placeholderQid = `q-${questionNumber}-${Date.now()}`;
  setTurns((prev) => [...prev, { qid: placeholderQid, prompt: "", loading: true }]);

  try {
    const res = await fetch("/api/check/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mission: {
          episodeTitle: mission.episodeTitle,
          episodeShortTitle: mission.episodeShortTitle,
          summary: mission.summary,
          concepts: mission.concepts,
          questions: mission.questions,
        },
        history,
        questionNumber,
        totalQuestions: TOTAL_QUESTIONS,
        probedConceptIds: Array.from(probedSet),
      }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    const q = json?.question;
    if (!q?.prompt || !Array.isArray(q?.rubric)) throw new Error("Malformed question");
    setTurns((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((t) => t.qid === placeholderQid);
      if (i < 0) return prev;
      copy[i] = {
        qid: placeholderQid,
        prompt: q.prompt,
        kind: q.kind,
        rubric: q.rubric,
        targetConceptIds: q.targetConceptIds ?? [],
        loading: false,
      };
      return copy;
    });
  } catch (err) {
    console.warn("question fetch failed, falling back to seed:", err);
    // Fallback: pull from mission.questions, skipping already-probed ones.
    const deeper = mission.questions.filter((q) => q.kind !== "recall");
    const probed = Array.from(probedSet);
    const seed = deeper.find((q) => !q.concepts.every((c) => probed.includes(c))) ?? deeper[0] ?? mission.questions[0];
    setTurns((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((t) => t.qid === placeholderQid);
      if (i < 0) return prev;
      copy[i] = {
        qid: placeholderQid,
        prompt: seed.prompt,
        kind: (seed.kind === "recall" ? "applied" : seed.kind) as Turn["kind"],
        rubric: seed.rubric,
        targetConceptIds: seed.concepts,
        loading: false,
      };
      return copy;
    });
  }
}

function computeFinal(mission: Mission, turns: Turn[]) {
  const scored = turns.filter((t) => !t.loading && t.score);
  const finalScore = scored.length === 0
    ? 0
    : Math.round(scored.reduce((acc, t) => acc + (t.score?.overall ?? 0), 0) / scored.length);
  const weak = Array.from(
    new Set(scored.flatMap((t) => t.score?.missedConcepts ?? [])),
  ).slice(0, 5);
  const perQuestion = scored.map((t) => ({
    qid: t.qid,
    prompt: t.prompt,
    score: t.score?.overall ?? 0,
    feedback: t.score?.feedback ?? "",
  }));
  return { finalScore, weak, perQuestion };
}

function finalizeScore(
  mission: Mission,
  turns: Turn[],
  completeMission: (id: string, payload: any) => void,
  setDone: (v: boolean) => void,
) {
  const { finalScore, weak, perQuestion } = computeFinal(mission, turns);
  completeMission(mission.id, {
    score: finalScore,
    weakConcepts: weak,
    perQuestion,
    xp: Math.round((mission.xp * finalScore) / 100),
    badge: mission.badge.name,
  });
  setDone(true);
}

async function scoreAnswer(q: QuestionTemplate, answer: string, episodeTitle: string): Promise<AnswerScore> {
  try {
    const res = await fetch("/api/check/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, answer, episodeTitle }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const json = await res.json();
    if (!json?.score) throw new Error("no score");
    return json.score as AnswerScore;
  } catch (err) {
    console.warn("scoreAnswer fell back to heuristic:", err);
    return scoreAnswerHeuristic(q, answer);
  }
}

function kindLabel(k?: string) {
  switch (k) {
    case "recall":    return "Recall";
    case "applied":   return "Applied";
    case "synthesis": return "Synthesis";
    case "pitch":     return "Pitch Challenge";
    default:          return "Question";
  }
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="size-1.5 rounded-full bg-cyan-300"
      initial={{ opacity: 0.3, y: 0 }}
      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
    />
  );
}
