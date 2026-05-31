"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Mic, Hash, ArrowRight } from "lucide-react";
import { ALL_MISSIONS } from "@/content/missions";
import { PODCAST_BY_ID } from "@/lib/podcasts";

/**
 * Command Palette (⌘K / Ctrl+K).
 *
 * Searches across all missions: title, podcast, guests, concept labels.
 * Results show episode title + podcast + first match category.
 * Selecting an episode navigates to its mission page.
 * Selecting a concept navigates to the episode containing it.
 */

type ResultKind = "mission" | "concept";
interface Result {
  kind: ResultKind;
  missionId: string;
  primary: string;
  secondary: string;
  podcastLabel?: string;
  score: number;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K (and `/` outside of inputs).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIdx(0);
      // Focus on next tick so the input is mounted.
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    if (!query) {
      // Default: show 6 most recent episodes as suggestions.
      return ALL_MISSIONS.slice(0, 6).map((m) => ({
        kind: "mission" as const,
        missionId: m.id,
        primary: m.episodeShortTitle,
        secondary: m.releasedDate,
        podcastLabel: PODCAST_BY_ID[m.podcastId]?.name,
        score: 0,
      }));
    }

    const out: Result[] = [];
    for (const m of ALL_MISSIONS) {
      const podcastName = PODCAST_BY_ID[m.podcastId]?.name ?? "";
      const titleScore = score(m.episodeTitle, query) + score(m.episodeShortTitle, query) * 1.2;
      const guestScore = m.guests.some((g) => g.toLowerCase().includes(query)) ? 6 : 0;
      const podScore = podcastName.toLowerCase().includes(query) ? 4 : 0;
      const total = titleScore + guestScore + podScore;
      if (total > 0) {
        out.push({
          kind: "mission",
          missionId: m.id,
          primary: m.episodeShortTitle,
          secondary: `${podcastName} · ${m.releasedDate}`,
          podcastLabel: podcastName,
          score: total + 10, // missions outrank concept hits slightly
        });
      }
      for (const c of m.concepts) {
        if (c.label.toLowerCase().includes(query)) {
          out.push({
            kind: "concept",
            missionId: m.id,
            primary: c.label,
            secondary: `Concept in: ${m.episodeShortTitle}`,
            podcastLabel: podcastName,
            score: 5 + (c.label.toLowerCase().startsWith(query) ? 3 : 0),
          });
        }
      }
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 12);
  }, [q]);

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  function go(r: Result) {
    router.push(`/mission/${r.missionId}`);
    setOpen(false);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[activeIdx];
      if (r) go(r);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-start justify-center pt-[12vh] px-4"
          style={{ background: "rgba(5,6,12,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            className="panel rounded-2xl w-full max-w-xl overflow-hidden"
            style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(34,211,238,0.18)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <Search size={16} className="text-cyan-300" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search episodes, guests, concepts…"
                className="flex-1 bg-transparent text-sm placeholder:text-ink-faint focus:outline-none"
              />
              <kbd className="text-[10px] text-ink-faint border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-ink-dim">
                  No matches. Try a guest name, concept, or podcast.
                </div>
              ) : (
                <ul className="py-1.5">
                  {results.map((r, i) => {
                    const active = i === activeIdx;
                    const Icon = r.kind === "mission" ? Mic : Hash;
                    return (
                      <li key={`${r.kind}-${r.missionId}-${r.primary}-${i}`}>
                        <button
                          onClick={() => go(r)}
                          onMouseEnter={() => setActiveIdx(i)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition"
                          style={{
                            background: active ? "rgba(34,211,238,0.08)" : "transparent",
                          }}
                        >
                          <div
                            className="size-8 rounded-lg grid place-items-center shrink-0"
                            style={{
                              background: r.kind === "mission" ? "rgba(34,211,238,0.12)" : "rgba(168,85,247,0.12)",
                              boxShadow: `inset 0 0 0 1px ${r.kind === "mission" ? "rgba(34,211,238,0.3)" : "rgba(168,85,247,0.3)"}`,
                            }}
                          >
                            <Icon size={14} className={r.kind === "mission" ? "text-cyan-200" : "text-purple-200"} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-ink font-medium truncate">{r.primary}</div>
                            <div className="text-[11px] text-ink-dim truncate">{r.secondary}</div>
                          </div>
                          {active && <ArrowRight size={14} className="text-cyan-300 shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-ink-faint">
              <span>↑↓ navigate · ↵ open · esc close</span>
              <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Cheap fuzzy-ish score: substring matches beat nothing; word-boundary starts beat substring. */
function score(haystack: string, needle: string): number {
  if (!haystack || !needle) return 0;
  const h = haystack.toLowerCase();
  const idx = h.indexOf(needle);
  if (idx < 0) return 0;
  let s = 4;
  if (idx === 0) s += 4;
  else if (h[idx - 1] === " " || h[idx - 1] === "-") s += 2;
  return s;
}
