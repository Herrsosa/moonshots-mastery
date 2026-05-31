"use client";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Users, Headphones, Sparkles, AlertTriangle, MessageSquare, Repeat } from "lucide-react";
import { ALL_MISSIONS } from "@/content/missions";

// Recharts is ~200KB gzipped; defer it so the route opens fast on slow connections.
const Charts = dynamic(() => import("@/components/analytics/Charts").then((m) => m.Charts), {
  ssr: false,
  loading: () => (
    <div className="panel rounded-2xl p-5 h-72 animate-pulse" />
  ),
});

const ATTEMPT_DATA = ALL_MISSIONS.slice(0, 7).map((m, i) => ({
  name: m.episodeShortTitle.length > 18 ? m.episodeShortTitle.slice(0, 16) + "…" : m.episodeShortTitle,
  attempts: 240 + i * 35 + Math.round(((i * 37) % 80)),
  mastery: 58 + Math.round(((i * 53) % 30)),
}));

const RADIAL_DATA = [
  { name: "Mastered",   value: 68, fill: "#22C55E" },
  { name: "In Progress",value: 22, fill: "#22D3EE" },
  { name: "Weak",       value: 10, fill: "#F59E0B" },
];

const STRUGGLED = [
  { c: "Orbital data centers",  v: 72 },
  { c: "China automation edge", v: 68 },
  { c: "Geopolitical AI race",  v: 64 },
  { c: "Recursive self-improvement", v: 61 },
  { c: "Energy bottlenecks", v: 55 },
  { c: "Gene drives", v: 49 },
];

const REPLAYS = [
  { t: "00:18 — '92 GW shortage'", count: 1820 },
  { t: "30:36 — 'China vertical integration'", count: 1411 },
  { t: "20:00 — 'scaling laws not done yet'", count: 1267 },
  { t: "27:58 — 'energy argument says space wins'", count: 1054 },
];

const QUESTIONS = [
  "How does Schmidt's 92 GW number reconcile with permit reform?",
  "Is orbital data really cheaper after launch costs?",
  "Which Chinese OEM is the real EV→robotics bridge?",
];

export default function AnalyticsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1280px] mx-auto">
      <div className="flex items-center gap-2">
        <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-semibold">Creator Console</div>
        <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-400/40 text-amber-200 bg-amber-500/10">Sample data</span>
      </div>
      <h1 className="mt-1 text-3xl md:text-4xl font-bold text-gradient-mastery">Engagement Analytics</h1>
      <p className="mt-1 text-ink-dim text-sm">A preview of what a show would see once real listeners take mastery checks — illustrative figures for now.</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Active Learners" value="14,832" delta="+12% w/w" icon={<Users size={18} />} color="cyan" />
        <KPI label="Mission Completions" value="3,210" delta="+8% w/w" icon={<Headphones size={18} />} color="purple" />
        <KPI label="Avg Mastery Score" value="78%" delta="+2 pts" icon={<Sparkles size={18} />} color="green" />
        <KPI label="Replay Rate"      value="61%" delta="of users replay key moments" icon={<Repeat size={18} />} color="amber" />
      </div>

      <Charts attemptData={ATTEMPT_DATA} radialData={RADIAL_DATA} />

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-300" />
            <div className="text-[11px] uppercase tracking-widest text-amber-300/80 font-semibold">Top struggled concepts</div>
          </div>
          <ul className="space-y-2">
            {STRUGGLED.map((s) => (
              <li key={s.c}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-ink">{s.c}</span>
                  <span className="text-amber-300 font-mono">{s.v}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-bg-line overflow-hidden">
                  <motion.div className="h-full"
                    initial={{ width: 0 }} animate={{ width: `${s.v}%` }} transition={{ duration: 0.8 }}
                    style={{ background: "linear-gradient(90deg,#F59E0B,#EF4444)", boxShadow: "0 0 8px rgba(245,158,11,0.5)" }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Repeat size={16} className="text-cyan-300" />
            <div className="text-[11px] uppercase tracking-widest text-cyan-300/80 font-semibold">Most replayed moments</div>
          </div>
          <ul className="space-y-2">
            {REPLAYS.map((r) => (
              <li key={r.t} className="flex items-center justify-between text-[12px] panel-soft rounded-lg px-3 py-2">
                <span className="text-ink">{r.t}</span>
                <span className="text-cyan-300 font-mono">{r.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-purple-300" />
            <div className="text-[11px] uppercase tracking-widest text-purple-300/80 font-semibold">Top user questions</div>
          </div>
          <ul className="space-y-2">
            {QUESTIONS.map((q, i) => (
              <li key={i} className="text-[12px] text-ink panel-soft rounded-lg px-3 py-2">
                &ldquo;{q}&rdquo;
              </li>
            ))}
          </ul>
          <div className="mt-3 text-[11px] text-ink-faint">
            Use these as prompts for the next episode brief.
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, icon, color }: { label: string; value: string; delta: string; icon: React.ReactNode; color: string }) {
  const palette: Record<string, string> = {
    cyan: "from-cyan-500/20 to-cyan-500/0 ring-cyan-400/30 text-cyan-200",
    purple: "from-purple-500/20 to-purple-500/0 ring-purple-400/30 text-purple-200",
    green: "from-emerald-500/20 to-emerald-500/0 ring-emerald-400/30 text-emerald-200",
    amber: "from-amber-500/20 to-amber-500/0 ring-amber-400/30 text-amber-200",
  };
  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`size-9 rounded-xl bg-gradient-to-br ${palette[color]} ring-1 grid place-items-center`}>{icon}</div>
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
      </div>
      <div className="text-2xl md:text-3xl font-bold font-mono text-gradient-mastery">{value}</div>
      <div className="text-[11px] text-ink-dim">{delta}</div>
    </div>
  );
}
