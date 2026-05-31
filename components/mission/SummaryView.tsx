"use client";
import { useMemo } from "react";

/**
 * SummaryView
 *
 * Renders mission.summary as a readable lead + bullet list instead of a
 * dense paragraph. We keep the source data as a single string (so transcripts
 * stay easy to author) and parse here at render time.
 *
 * Parsing rules:
 *  1. Split into sentences on ". " (and "? "/"! "), keeping punctuation.
 *  2. The first 1-2 sentences become a "lead" paragraph — they set context.
 *  3. The rest become bullets. We merge very short fragments into the next
 *     bullet to avoid orphan one-liners.
 */
export function SummaryView({ text }: { text: string }) {
  const { lead, bullets } = useMemo(() => parse(text), [text]);

  return (
    <div className="mt-2 text-sm md:text-base text-ink leading-relaxed">
      {lead && <p className="mb-3">{lead}</p>}
      {bullets.length > 0 && (
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <span
                aria-hidden
                className="mt-2 size-1.5 rounded-full shrink-0"
                style={{ background: "#67E8F9", boxShadow: "0 0 6px rgba(34,211,238,0.7)" }}
              />
              <span className="text-ink-dim md:text-ink leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function parse(text: string): { lead: string; bullets: string[] } {
  if (!text || !text.trim()) return { lead: "", bullets: [] };

  // Split on sentence boundary while keeping the terminator with the sentence.
  // Handles ". " "? " "! " — tolerates extra whitespace.
  const raw = text
    .split(/(?<=[.!?])\s+(?=[A-Z(0-9$"'])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  if (raw.length <= 2) return { lead: raw.join(" "), bullets: [] };

  // Lead = first 1-2 sentences. If sentence 1 is short (<14 words), grab two.
  const firstWords = raw[0].split(/\s+/).length;
  const leadCount = firstWords < 14 ? 2 : 1;
  const lead = raw.slice(0, leadCount).join(" ");

  // Merge ultra-short fragments (<6 words) into the next bullet so we don't
  // litter with "Yes." / "No." / "Source: X" orphans.
  const tail = raw.slice(leadCount);
  const bullets: string[] = [];
  let buffer = "";
  for (const s of tail) {
    const wc = s.split(/\s+/).length;
    if (wc < 6 && buffer === "") {
      buffer = s;
      continue;
    }
    if (buffer) {
      bullets.push(`${buffer} ${s}`);
      buffer = "";
    } else {
      bullets.push(s);
    }
  }
  if (buffer) bullets.push(buffer);

  return { lead, bullets };
}
