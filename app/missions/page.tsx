"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { ALL_MISSIONS } from "@/content/missions";
import { BRANCH_LABEL } from "@/lib/tree";
import { BranchIcon } from "@/components/primitives/BranchIcon";
import { useStore } from "@/lib/store";

type IconKey = "brain"|"robot"|"dna"|"bolt"|"rocket"|"leaf"|"chart"|"user";

export default function MissionsListPage() {
  const { missions } = useStore();
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
      <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">All Missions</div>
      <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gradient-mastery">Episode Missions</h1>
      <p className="mt-1 text-ink-dim text-sm">Every episode is independently masterable — start anywhere.</p>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {ALL_MISSIONS.map((m, i) => {
          const attempt = missions[m.id];
          const isMastered = (attempt?.score ?? 0) >= 80;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/mission/${m.id}`}
                className="panel rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.03] transition-colors group block"
              >
                <div className="flex items-start gap-3">
                  <div className="size-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-400/30 grid place-items-center">
                    <BranchIcon iconKey={iconFor(m.branch)} size={20} color="#67E8F9" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">{BRANCH_LABEL[m.branch]}</div>
                    <div className="font-bold text-ink mt-0.5 truncate">{m.episodeShortTitle}</div>
                    <div className="text-[11px] text-ink-faint truncate">{m.guests.join(" · ")}</div>
                  </div>
                  {isMastered && <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-200 bg-emerald-500/10">MASTERED</span>}
                  {!isMastered && attempt && <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/40 text-cyan-200 bg-cyan-500/10">IN PROGRESS</span>}
                  {!attempt && <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-400/40 text-purple-200 bg-purple-500/10">AVAILABLE</span>}
                </div>
                <p className="text-sm text-ink-dim line-clamp-2 leading-relaxed">{m.summary}</p>
                <div className="flex items-center gap-3 text-[11px] text-ink-faint">
                  <span className="inline-flex items-center gap-1"><Clock size={11} /> {m.duration}</span>
                  <span>·</span>
                  <span>{m.difficulty}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-cyan-300">
                    <Sparkles size={11} /> +{m.xp} XP
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function iconFor(b: string): IconKey {
  const map: Record<string, IconKey> = {
    ai: "brain", robotics: "robot", longevity: "dna", energy: "bolt",
    space: "rocket", biotech: "leaf", markets: "chart", abundance: "user",
  };
  return map[b] ?? "brain";
}
