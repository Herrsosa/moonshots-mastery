"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, Trophy, ArrowRight, RotateCcw, AlertTriangle, Share2, Check,
  MessageSquare, ChevronDown, TrendingUp,
} from "lucide-react";
import type { Mission } from "@/lib/types";
import { Counter } from "@/components/primitives/Counter";
import { playChime, playSweep } from "@/lib/sounds";

export interface PerQuestionResult {
  qid: string;
  prompt: string;
  score: number;
  feedback: string;
}

/**
 * ScoreCard — final celebration + analysis.
 *
 * v0.1 demo restructure: two clearly separated zones.
 *   HERO  — dial, tier, XP, badge, optional "Beat your best" delta. Celebratory.
 *   REVIEW — collapsed by default. Weak areas + per-question feedback live behind
 *            a "See feedback (N questions)" affordance so the celebration moment
 *            isn't immediately drowned in analysis.
 */
export function ScoreCard({
  mission, score, weakConcepts, xpGained, nextMissionId, perQuestion, previousScore,
}: {
  mission: Mission;
  score: number;
  weakConcepts: string[];
  xpGained: number;
  nextMissionId?: string;
  perQuestion?: PerQuestionResult[];
  /** Best score on this mission BEFORE this attempt — drives the "beat your best" delta. */
  previousScore?: number;
}) {
  const tier = score >= 90 ? "Master" : score >= 80 ? "Expert" : score >= 65 ? "Apprentice" : "Novice";
  const tierColor = score >= 90 ? "#22C55E" : score >= 80 ? "#22D3EE" : score >= 65 ? "#A855F7" : "#F59E0B";
  const [shared, setShared] = useState(false);

  // Score-reveal audio sweep + (if mastered) badge chime. Silently no-ops if muted.
  useEffect(() => {
    playSweep();
    if (score >= 80) {
      const t = setTimeout(() => playChime(), 1300);
      return () => clearTimeout(t);
    }
  }, [score]);

  async function handleShare() {
    const text = `I just earned the "${mission.badge.name}" badge on MoonshotsMastery — ${score}/100 on "${mission.episodeShortTitle}". 🎧`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "MoonshotsMastery", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {/* user cancelled */}
  }

  const isRetake = typeof previousScore === "number";
  const delta = isRetake ? score - (previousScore as number) : 0;
  const beatBest = isRetake && delta > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="panel rounded-3xl p-7 md:p-10 max-w-2xl mx-auto relative overflow-hidden"
    >
      <Burst color={tierColor} />

      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold flex items-center gap-2 justify-center">
          <Sparkles size={12} /> Mastery Check Complete
        </div>

        {/* Retake delta banner — first thing the user sees on a retake */}
        {beatBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 mx-auto w-fit px-3 py-1.5 rounded-full text-[12px] font-semibold inline-flex items-center gap-2"
            style={{
              background: "linear-gradient(90deg, rgba(34,197,94,0.18), rgba(34,211,238,0.18))",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#86EFAC",
              boxShadow: "0 0 18px rgba(34,197,94,0.25)",
            }}
          >
            <TrendingUp size={13} />
            <span>Beat your best: {previousScore} → {score} <span className="font-mono">(+{delta})</span></span>
          </motion.div>
        )}
        {isRetake && !beatBest && (
          <div className="mt-3 mx-auto w-fit text-[11px] text-ink-dim">
            Previous best: <span className="font-mono text-ink">{previousScore}</span>
          </div>
        )}

        <div className="mt-3 grid place-items-center">
          <ScoreDial value={score} color={tierColor} />
        </div>

        <div className="mt-2 text-center">
          <div className="text-sm text-ink-dim">Mastery Score</div>
          <div className="text-xs mt-1 font-semibold" style={{ color: tierColor }}>{tier} tier</div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <BadgeReveal mission={mission} color={tierColor} unlocked={score >= 80} />
          <div className="panel-soft rounded-2xl p-4 flex flex-col justify-center">
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">XP Gained</div>
            <div className="text-3xl font-bold font-mono text-cyan-200">
              +<Counter value={xpGained} duration={1.4} />
            </div>
            <div className="mt-1 text-[11px] text-ink-dim">
              {isRetake && delta <= 0
                ? "no new XP — you've already earned this"
                : "added to your total"}
            </div>
          </div>
        </div>

        {/* REVIEW zone. Auto-opens when the learner needs feedback the most
            (score < 65). Stays collapsed on strong scores so the celebration
            moment dominates. */}
        {(weakConcepts.length > 0 || (perQuestion && perQuestion.length > 0)) && (
          <details
            className="mt-6 panel-soft rounded-2xl group"
            open={score < 65}
            style={
              score < 65
                ? { boxShadow: "inset 0 0 0 1px rgba(252,211,77,0.4), 0 0 22px rgba(252,211,77,0.18)" }
                : undefined
            }
          >
            <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3.5">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className={score < 65 ? "text-amber-300" : "text-cyan-300"} />
                <div>
                  <div
                    className="text-[11px] uppercase tracking-widest font-semibold"
                    style={{ color: score < 65 ? "#FCD34D" : "#67E8F9" }}
                  >
                    {score < 65 ? "Where to focus next" : "Detailed feedback"}
                  </div>
                  {perQuestion && (
                    <div className="text-[10px] text-ink-faint mt-0.5">
                      {perQuestion.length} question{perQuestion.length === 1 ? "" : "s"} reviewed · tap to {score < 65 ? "collapse" : "expand"}
                    </div>
                  )}
                </div>
              </div>
              <ChevronDown
                size={14}
                className="text-ink-dim transition-transform group-open:rotate-180 shrink-0"
              />
            </summary>

            <div className="px-4 pb-4 space-y-4">
              {/* Coach takeaway — single-glance summary of what to fix next.
                  Computed from the lowest-scoring question's feedback when available. */}
              {(() => {
                const weakest = (perQuestion ?? [])
                  .filter((q) => q.feedback)
                  .sort((a, b) => a.score - b.score)[0];
                if (!weakest) return null;
                return (
                  <div className="rounded-xl px-3 py-2.5 border border-amber-400/30 bg-amber-500/5">
                    <div className="text-[10px] uppercase tracking-widest text-amber-200/80 font-semibold mb-1">
                      Coach takeaway
                    </div>
                    <p className="text-xs text-ink leading-relaxed">{weakest.feedback}</p>
                  </div>
                );
              })()}

              {weakConcepts.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-amber-300/80 font-semibold flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={11} /> Specific gaps to re-listen for
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {weakConcepts.slice(0, 6).map((c, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-200">
                        {c.length > 60 ? c.slice(0, 57) + "…" : c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {perQuestion && perQuestion.length > 0 && (
                <div className="space-y-3">
                  {perQuestion.map((q, i) => (
                    <div key={q.qid} className="border-l-2 pl-3" style={{ borderColor: scoreColor(q.score) }}>
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-xs font-semibold text-ink-dim">Q{i + 1}</div>
                        <div className="text-xs font-bold font-mono" style={{ color: scoreColor(q.score) }}>
                          {q.score}/100
                        </div>
                      </div>
                      <p className="text-[11px] text-ink-dim mt-0.5 leading-snug">{q.prompt}</p>
                      {q.feedback && <p className="text-xs text-ink mt-1.5 leading-relaxed">{q.feedback}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href={`/mission/${mission.id}/check?attempt=${Date.now()}`}
            className="panel-soft rounded-xl px-4 py-3 inline-flex items-center justify-center gap-2 text-sm text-ink hover:bg-white/5"
          >
            <RotateCcw size={14} /> Re-take
          </Link>
          <button
            onClick={handleShare}
            className="panel-soft rounded-xl px-4 py-3 inline-flex items-center justify-center gap-2 text-sm text-ink hover:bg-white/5"
          >
            {shared ? (<><Check size={14} className="text-emerald-300" /> Copied</>) : (<><Share2 size={14} /> Share</>)}
          </button>
          {nextMissionId && (
            <Link
              href={`/mission/${nextMissionId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-4 py-3 text-cyan-100 text-sm font-semibold"
              style={{ boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}
            >
              Next mission <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreDial({ value, color }: { value: number; color: string }) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const dur = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="relative grid place-items-center" style={{ width: 180, height: 180 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <defs>
          <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={r} stroke="#1F2937" strokeWidth="10" fill="none" />
        <motion.circle
          cx="90" cy="90" r={r}
          stroke="url(#dialGrad)" strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 90 90)"
          style={{ filter: `drop-shadow(0 0 12px ${color})` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-5xl font-bold font-mono text-gradient-mastery">{displayed}</div>
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">out of 100</div>
      </div>
    </div>
  );
}

function BadgeReveal({ mission, color, unlocked }: { mission: Mission; color: string; unlocked: boolean }) {
  const r = 28;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 12 }}
      className="panel-soft rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="relative" style={{ width: 56, height: 56 }}>
        <svg width={56} height={56}>
          <polygon points={pts} fill={`${unlocked ? color : "#3F3F46"}22`} stroke={unlocked ? color : "#52525B"} strokeWidth={2}
            style={unlocked ? { filter: `drop-shadow(0 0 12px ${color})` } : undefined} />
        </svg>
        <Trophy size={22} className="absolute inset-0 m-auto" color={unlocked ? color : "#52525B"} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">
          {unlocked ? "Badge unlocked" : "Badge not yet earned"}
        </div>
        <div className={`text-sm font-bold mt-0.5 ${unlocked ? "text-ink" : "text-ink-faint"}`}>{mission.badge.name}</div>
        <div className="text-[10px] capitalize" style={{ color: unlocked ? color : "#52525B" }}>
          {unlocked ? mission.badge.rarity : "score ≥80 to unlock"}
        </div>
      </div>
    </motion.div>
  );
}

function scoreColor(v: number) {
  if (v >= 80) return "#86EFAC";
  if (v >= 65) return "#67E8F9";
  if (v >= 40) return "#FCD34D";
  return "#F87171";
}

function Burst({ color }: { color: string }) {
  const rays = Array.from({ length: 12 });
  return (
    <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {rays.map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-[18%] left-1/2 origin-bottom"
          style={{
            width: 2, height: 60, transform: `translateX(-50%) rotate(${(i / rays.length) * 360}deg)`,
            background: `linear-gradient(to top, transparent, ${color}88, transparent)`,
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1.4, 1], opacity: [0, 1, 0.6] }}
          transition={{ delay: 0.2 + i * 0.04, duration: 1.4 }}
        />
      ))}
    </motion.div>
  );
}
