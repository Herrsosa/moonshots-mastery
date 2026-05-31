"use client";
import { useMemo } from "react";
import { Award, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";
import { buildConceptStats } from "@/lib/concepts";
import { dailyXp } from "@/lib/review";
import { Counter } from "@/components/primitives/Counter";

/**
 * Five-card strip under the tree on desktop. Every number is derived from the
 * store, so it stays honest as the user takes mastery checks.
 */
export function DashboardStrip() {
  const missions = useStore((s) => s.missions);
  const badges = useStore((s) => s.badges);
  const hydrated = useStore((s) => s.hydrated);

  const stats = useMemo(() => {
    const entries = Object.entries(missions); // [missionId, attempt]
    const attempts = entries.map(([, a]) => a);
    const totalScore = attempts.reduce((a, x) => a + x.score, 0);
    const avgScore = attempts.length ? Math.round(totalScore / attempts.length) : 0;
    const masteryScore = Math.min(1000, Math.round(attempts.reduce((a, x) => a + x.score * 10, 0)));

    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const xpWeek = entries.reduce((acc, [id, a]) => {
      if (!a.completedAt || new Date(a.completedAt).getTime() < weekAgo) return acc;
      const m = ALL_MISSIONS.find((mm) => mm.id === id);
      if (!m) return acc;
      return acc + Math.round((m.xp * a.score) / 100);
    }, 0);

    const conceptStats = buildConceptStats(ALL_MISSIONS, missions);
    return {
      masteryScore,
      avgScore,
      xpWeek: Math.max(xpWeek, 0),
      xpByDay: dailyXp(ALL_MISSIONS, missions, 7),
      attemptedCount: attempts.length,
      completionRate: attempts.length
        ? Math.round((attempts.filter((x) => x.score >= 80).length / attempts.length) * 100)
        : 0,
      mastered: conceptStats.filter((c) => c.state === "mastered").length,
      inProgress: conceptStats.filter((c) => c.state === "in_progress").length,
      weak: conceptStats.filter((c) => c.state === "weak").length,
      total: conceptStats.length,
    };
  }, [missions]);

  const recentBadge = badges[badges.length - 1] ?? "First mission";

  return (
    <div className="hidden md:grid mt-6 grid-cols-5 gap-4">
      <StatCard
        label="Mastery Score"
        value={hydrated ? <Counter value={stats.masteryScore} /> : "—"}
        sub={`/ 1000 · ${tierFor(stats.avgScore)}`}
        delta={`avg ${stats.avgScore}%`}
      />
      <BarCard label="XP Gained This Week" total={stats.xpWeek} byDay={stats.xpByDay} hydrated={hydrated} />
      <RecentlyUnlocked badge={recentBadge} />
      <DonutCard mastered={pct(stats.mastered, stats.total)} inProgress={pct(stats.inProgress, stats.total)} weak={pct(stats.weak, stats.total)} />
      <CreatorAnalytics attempts={stats.attemptedCount} completion={stats.completionRate} avg={stats.avgScore} weakConcepts={[...new Set(Object.values(missions).flatMap((a) => a.weakConcepts))].slice(0, 3)} />
    </div>
  );
}

function pct(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

function tierFor(avg: number) {
  if (avg >= 90) return "Master";
  if (avg >= 80) return "Expert";
  if (avg >= 65) return "Apprentice";
  if (avg > 0)  return "Novice";
  return "—";
}

function StatCard({ label, value, sub, delta }: { label: string; value: React.ReactNode; sub: string; delta: string }) {
  return (
    <div className="panel rounded-2xl p-4 flex gap-4 items-start">
      <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-400/30 grid place-items-center">
        <Award size={22} className="text-cyan-200" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
        <div className="mt-0.5 text-3xl font-bold font-mono text-gradient-mastery">{value}</div>
        <div className="text-[10px] text-ink-dim">{sub}</div>
        <div className="mt-2 inline-flex items-center gap-1 text-emerald-300 text-[11px] font-semibold">
          <TrendingUp size={12} /> {delta}
        </div>
      </div>
    </div>
  );
}

function BarCard({ label, total, byDay, hydrated }: { label: string; total: number; byDay: { day: string; xp: number }[]; hydrated: boolean }) {
  // Real per-day XP. Heights are scaled to the busiest day so the tallest bar is
  // always full-height; a zero day shows a faint baseline stub.
  const max = Math.max(1, ...byDay.map((d) => d.xp));
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">{label}</div>
      <div className="mt-0.5 text-3xl font-bold font-mono text-cyan-200">
        {hydrated ? <Counter value={total} /> : total.toLocaleString()} <span className="text-xs text-ink-dim font-sans">XP</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5 items-end h-16">
        {byDay.map((d, i) => {
          const h = d.xp > 0 ? Math.max(12, Math.round((d.xp / max) * 100)) : 4;
          return (
            <div
              key={i}
              title={`${d.xp} XP`}
              className="rounded-t-sm w-full transition-all"
              style={{
                height: `${h}%`,
                background: d.xp > 0
                  ? "linear-gradient(180deg,#67E8F9 0%, #6366F1 100%)"
                  : "rgba(99,102,241,0.18)",
                boxShadow: d.xp > 0 ? "0 0 8px rgba(34,211,238,0.5)" : "none",
              }}
            />
          );
        })}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1.5 text-[10px] text-ink-faint text-center">
        {byDay.map((d, i) => <span key={i}>{d.day}</span>)}
      </div>
    </div>
  );
}

function RecentlyUnlocked({ badge }: { badge: string }) {
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">Recently Unlocked</div>
      <div className="mt-2 flex items-center gap-3">
        <div className="size-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/40 grid place-items-center"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.4)" }}>
          <span className="text-amber-300 text-lg">⚡</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-ink leading-tight">{badge}</div>
          <div className="text-[11px] text-amber-300 mt-0.5">Latest badge</div>
        </div>
      </div>
    </div>
  );
}

function DonutCard({ mastered, inProgress, weak }: { mastered: number; inProgress: number; weak: number }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">Concepts Mastered vs Weak Areas</div>
      <div className="mt-2 flex items-center gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} stroke="#1F2937" strokeWidth="10" fill="none" />
          <circle cx="40" cy="40" r={r} stroke="#22C55E" strokeWidth="10" fill="none"
            strokeDasharray={`${(mastered/100)*c} ${c}`} strokeDashoffset={0} transform="rotate(-90 40 40)"
            style={{ filter: "drop-shadow(0 0 4px rgba(34,197,94,0.6))" }} />
          <circle cx="40" cy="40" r={r} stroke="#22D3EE" strokeWidth="10" fill="none"
            strokeDasharray={`${(inProgress/100)*c} ${c}`} strokeDashoffset={-((mastered/100)*c)} transform="rotate(-90 40 40)" />
          <circle cx="40" cy="40" r={r} stroke="#F59E0B" strokeWidth="10" fill="none"
            strokeDasharray={`${(weak/100)*c} ${c}`} strokeDashoffset={-(((mastered+inProgress)/100)*c)} transform="rotate(-90 40 40)" />
          <text x="40" y="42" textAnchor="middle" className="fill-emerald-200 font-bold" fontSize="16">{mastered}%</text>
          <text x="40" y="56" textAnchor="middle" className="fill-ink-dim" fontSize="8">Mastered</text>
        </svg>
        <div className="text-[11px] space-y-1">
          <LegendRow color="#22C55E" label="Mastered" value={`${mastered}%`} />
          <LegendRow color="#22D3EE" label="In Progress" value={`${inProgress}%`} />
          <LegendRow color="#F59E0B" label="Weak Areas" value={`${weak}%`} />
        </div>
      </div>
    </div>
  );
}
function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-sm" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
      <span className="text-ink-dim">{label}</span>
      <span className="ml-auto text-ink font-semibold">{value}</span>
    </div>
  );
}

function CreatorAnalytics({ attempts, completion, avg, weakConcepts }: { attempts: number; completion: number; avg: number; weakConcepts: string[] }) {
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-dim">Creator Analytics <span className="text-ink-faint">(You)</span></div>
      <ul className="mt-2 space-y-1.5 text-[12px]">
        <StatRow label="Missions Attempted" value={attempts.toString()} />
        <StatRow label="Mastery Completion" value={`${completion}%`} />
        <StatRow label="Average Score" value={`${avg}%`} />
      </ul>
      <div className="mt-3 text-[10px] uppercase tracking-widest text-ink-dim">Top Struggled Concepts</div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {weakConcepts.length > 0 ? weakConcepts.map((c, i) => (
          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-200 border border-amber-400/30">
            {c.length > 28 ? c.slice(0, 25) + "…" : c}
          </span>
        )) : (
          <span className="text-[10px] text-ink-faint">No gaps yet</span>
        )}
      </div>
    </div>
  );
}
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-ink-dim">{label}</span>
      <span className="font-semibold text-ink font-mono">{value}</span>
    </li>
  );
}
