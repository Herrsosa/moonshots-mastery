"use client";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, CalendarDays, Quote, ChevronLeft, BookOpen, Trophy, ExternalLink, Play, Target, Lightbulb, Hash, GitCommitHorizontal } from "lucide-react";
import { MISSION_BY_ID } from "@/content/missions";
import { BRANCH_LABEL } from "@/lib/tree";
import { useStore } from "@/lib/store";
import { youtubeLinkAt } from "@/lib/streak";
import { SummaryView } from "@/components/mission/SummaryView";
import { buildMasteryObject } from "@/lib/masteryObject";
import { threadsForMission, missionChanges, THREAD_BY_ID } from "@/lib/threads";

/**
 * Mission detail page.
 *
 * Trimmed for v0.1 demo:
 *  - Single 1-line meta row (duration · released · YouTube) — was three Meta cards.
 *  - episodeTitle is now a hover title attr instead of a third heading line.
 *  - Top evidence quote rendered as a "hero quote" pull-quote.
 *  - Remaining evidence collapses to top 3 with "Show all N" toggle.
 */
export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const m = MISSION_BY_ID[id];
  const { missions } = useStore();
  if (!m) return notFound();
  const attempt = missions[m.id];

  // Pick the "spiciest" evidence quote for the hero — longest of the first three
  // is usually the most concept-dense. Cheap heuristic, no LLM needed.
  const heroQuote = m.evidence
    .slice(0, 3)
    .sort((a, b) => b.quote.length - a.quote.length)[0];

  // Structured "mastery object" — thesis, ideas, KPIs, voices, threads, changes.
  const mo = buildMasteryObject(m);
  const detailThreads = threadsForMission(m);
  const changes = missionChanges(m.id);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-4">
        <ChevronLeft size={16} /> Back to map
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left: mission card */}
        <div className="panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 size-80 rounded-full opacity-40"
            style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.4), transparent)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">
              <BookOpen size={12} /> Moonshots · {BRANCH_LABEL[m.branch]}
              {m.episodeNumber != null && (
                <span className="font-mono text-ink-faint">· #{m.episodeNumber}</span>
              )}
            </div>
            <h1
              className="mt-2 text-3xl md:text-4xl font-bold text-gradient-mastery leading-tight"
              title={m.episodeTitle /* full title on hover — keeps header chrome light */}
            >
              {m.episodeShortTitle}
            </h1>
            <p className="mt-1 text-xs text-ink-faint">{m.guests.join(" · ")}</p>

            {/* Single-line meta row instead of three cards */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-dim">
              <span className="inline-flex items-center gap-1"><Clock size={11} /> {m.duration}</span>
              <span className="text-ink-faint">·</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {m.releasedDate}</span>
              {m.videoId && (
                <>
                  <span className="text-ink-faint">·</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${m.videoId}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-300/80 hover:text-cyan-200 transition-colors"
                  >
                    <Play size={11} /> Watch <ExternalLink size={9} />
                  </a>
                </>
              )}
            </div>

            {/* Hero quote — the spiciest line, big. Hooks the visitor in <5 sec. */}
            {heroQuote && (
              <motion.figure
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 relative panel-soft rounded-2xl p-5 md:p-6 overflow-hidden"
                style={{ boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.18)" }}
              >
                <Quote
                  size={48}
                  className="absolute -top-2 -left-2 text-purple-400/15"
                  aria-hidden
                />
                <blockquote className="relative text-base md:text-lg leading-snug text-ink font-medium italic">
                  &ldquo;{heroQuote.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-2 text-[11px] text-ink-dim">
                  — {heroQuote.speaker}
                  {heroQuote.tStart && <span className="font-mono ml-2">{heroQuote.tStart}</span>}
                </figcaption>
              </motion.figure>
            )}

            {/* THESIS — the episode's core argument, one line. */}
            <h2 className="mt-7 text-xs uppercase tracking-widest text-cyan-300/80 font-semibold flex items-center gap-2">
              <Target size={13} /> The thesis
            </h2>
            <p className="mt-2 text-base md:text-lg text-ink leading-snug font-medium">{mo.thesis}</p>

            {/* IDEAS TO MASTER — the concrete claims the check will probe. */}
            <h2 className="mt-6 text-xs uppercase tracking-widest text-ink-dim font-semibold flex items-center gap-2">
              <Lightbulb size={13} className="text-amber-300" /> Master these {mo.ideas.length} ideas
            </h2>
            <ol className="mt-2 space-y-1.5">
              {mo.ideas.map((idea, i) => (
                <li key={i} className="flex gap-2.5 items-start">
                  <span className="mt-0.5 size-5 shrink-0 grid place-items-center rounded-md bg-cyan-500/15 text-cyan-200 text-[11px] font-bold font-mono">{i + 1}</span>
                  <span className="text-sm text-ink leading-relaxed">{idea}</span>
                </li>
              ))}
            </ol>

            {/* KEY NUMBERS — the figures worth retaining. */}
            {mo.kpis.length > 0 && (
              <>
                <h2 className="mt-6 text-xs uppercase tracking-widest text-ink-dim font-semibold flex items-center gap-2">
                  <Hash size={13} className="text-emerald-300" /> Key numbers
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mo.kpis.map((k, i) => (
                    <span key={i} className="text-[12px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-emerald-100 font-mono">
                      {k}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* ENTITIES — threads in play + voices in the room. */}
            <h2 className="mt-6 text-xs uppercase tracking-widest text-ink-dim font-semibold">Threads in play</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {detailThreads.map((t) => (
                <span key={t.id} className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                  style={{ color: t.color, borderColor: `${t.color}55`, background: `${t.color}14` }}>
                  {t.label}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-faint">Voices: {mo.people.join(" · ")}</p>

            {/* WHAT CHANGED — evolution signal vs prior episodes. */}
            {changes.length > 0 && (
              <>
                <h2 className="mt-6 text-xs uppercase tracking-widest text-ink-dim font-semibold flex items-center gap-2">
                  <GitCommitHorizontal size={13} className="text-purple-300" /> What changed since earlier episodes
                </h2>
                <ul className="mt-2 space-y-1.5">
                  {changes.map((ch, i) => (
                    <li key={i} className="flex gap-2 items-start rounded-lg px-3 py-2" style={{ background: `${THREAD_BY_ID[ch.threadId]?.color ?? "#67E8F9"}10` }}>
                      <span className="text-[10px] font-semibold mt-0.5 shrink-0" style={{ color: THREAD_BY_ID[ch.threadId]?.color }}>
                        {THREAD_BY_ID[ch.threadId]?.label}
                      </span>
                      <span className="text-[12px] text-ink-dim leading-snug italic">{ch.text}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button
              onClick={() => router.push(`/mission/${m.id}/check`)}
              className="mt-8 group w-full md:w-auto inline-flex items-center gap-3 rounded-xl border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors px-5 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400/60"
              style={{ boxShadow: "0 0 28px rgba(34,211,238,0.3)" }}
            >
              <span className="size-10 rounded-lg bg-cyan-400/20 grid place-items-center">
                <Trophy size={18} className="text-cyan-200" />
              </span>
              <div className="text-left">
                <div className="text-base font-bold text-cyan-100">
                  {attempt ? "Re-take Mastery Check" : "Start Mastery Check"}
                </div>
                <div className="text-[12px] text-cyan-300/80">
                  {attempt ? `Best score: ${attempt.score}% — beat it for bonus XP` : `Mastery check · +${m.xp} XP available`}
                </div>
              </div>
              <ArrowRight size={20} className="ml-auto text-cyan-200 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Full briefing — secondary, collapsed. The structured object above is
                the primary learning surface; this is the deep-dive for the curious. */}
            <details className="mt-6 group">
              <summary className="flex items-center justify-between cursor-pointer list-none text-xs uppercase tracking-widest text-ink-dim font-semibold hover:text-ink transition-colors">
                <span className="flex items-center gap-2"><BookOpen size={13} /> Full briefing &amp; all concepts</span>
                <span className="text-ink-faint group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3">
                <SummaryView text={m.summary} />
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.concepts.map((c) => (
                    <span key={c.id} className={chipClass(c.color)}>
                      <span className="size-1.5 rounded-full" style={{ background: chipDot(c.color) }} />
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Right: badge + evidence */}
        <div className="flex flex-col gap-4">
          <div className="panel rounded-2xl p-6 flex items-center gap-4">
            <BadgePreview rarity={m.badge.rarity} />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink-dim">Reward badge</div>
              <div className="text-lg font-bold text-ink mt-0.5">{m.badge.name}</div>
              <div className="text-[11px] mt-0.5 text-amber-300 capitalize">{m.badge.rarity} · +{m.xp} XP</div>
            </div>
          </div>

          <EvidenceList mission={m} />
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Evidence — show only top 3 by default. A wall of 8 long quotes overwhelms a
 * first-time visitor; the rest stay one click away.
 */
function EvidenceList({ mission: m }: { mission: import("@/lib/types").Mission }) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 3;
  const visible = expanded ? m.evidence : m.evidence.slice(0, initialCount);
  const hiddenCount = m.evidence.length - initialCount;

  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-300/80 font-semibold mb-3">
        <Quote size={14} /> Transcript Evidence
        <span className="ml-auto text-[10px] text-ink-faint font-mono">
          {expanded ? m.evidence.length : Math.min(initialCount, m.evidence.length)}/{m.evidence.length}
        </span>
      </div>
      <ul className="space-y-3">
        {visible.map((e, i) => {
          const ytUrl = youtubeLinkAt(m.videoId, e.tStart);
          const Wrapper: any = ytUrl ? "a" : "div";
          const wrapperProps = ytUrl ? { href: ytUrl, target: "_blank", rel: "noreferrer" } : {};
          return (
            <li key={i}>
              <Wrapper
                {...wrapperProps}
                className={`block panel-soft rounded-xl p-3.5 ${ytUrl ? "hover:bg-white/5 transition-colors cursor-pointer group" : ""}`}
              >
                <div className="flex items-center gap-2 text-[11px] text-ink-dim mb-1">
                  <span className="font-semibold text-cyan-200">{e.speaker}</span>
                  <span className="text-ink-faint">·</span>
                  <span className="font-mono">{e.tStart}</span>
                  {ytUrl && (
                    <span className="ml-auto inline-flex items-center gap-1 text-cyan-300/60 group-hover:text-cyan-200 text-[10px]">
                      <Play size={10} /> jump
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink leading-relaxed">&ldquo;{e.quote}&rdquo;</p>
              </Wrapper>
            </li>
          );
        })}
      </ul>
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full text-[11px] text-cyan-300/80 hover:text-cyan-200 text-center py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {expanded ? "Show fewer quotes" : `Show all ${m.evidence.length} quotes (+${hiddenCount} more)`}
        </button>
      )}
    </div>
  );
}

function chipClass(color?: string) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border";
  switch (color) {
    case "cyan":   return `${base} border-cyan-400/30 text-cyan-200 bg-cyan-500/10`;
    case "purple": return `${base} border-purple-400/30 text-purple-200 bg-purple-500/10`;
    case "amber":  return `${base} border-amber-400/30 text-amber-200 bg-amber-500/10`;
    case "green":  return `${base} border-emerald-400/30 text-emerald-200 bg-emerald-500/10`;
    default:       return `${base} border-white/10 text-ink-dim bg-white/5`;
  }
}
function chipDot(color?: string) {
  switch (color) {
    case "cyan":   return "#22D3EE";
    case "purple": return "#A855F7";
    case "amber":  return "#F59E0B";
    case "green":  return "#22C55E";
    default:       return "#52525B";
  }
}

function BadgePreview({ rarity }: { rarity: "common"|"rare"|"epic"|"legendary" }) {
  const colors: Record<string, string> = {
    common: "#94A3B8", rare: "#22D3EE", epic: "#A855F7", legendary: "#F59E0B",
  };
  const c = colors[rarity];
  const r = 32;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width={64} height={64}>
        <polygon points={pts} fill={`${c}22`} stroke={c} strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 12px ${c})` }} />
      </svg>
      <Trophy size={26} className="absolute inset-0 m-auto" color={c} strokeWidth={2.2} />
    </div>
  );
}
