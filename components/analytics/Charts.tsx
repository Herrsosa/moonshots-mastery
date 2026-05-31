"use client";
/**
 * All Recharts-heavy elements pulled into this module so they can be
 * lazy-loaded by next/dynamic — keeps Recharts (~200KB) off the initial
 * bundle and only loaded when the user opens /analytics.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

export function Charts({
  attemptData, radialData,
}: {
  attemptData: { name: string; attempts: number; mastery: number }[];
  radialData: { name: string; value: number; fill: string }[];
}) {
  return (
    <div className="mt-6 grid lg:grid-cols-3 gap-4">
      <div className="panel rounded-2xl p-5 lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-ink-dim">Per-episode performance</div>
            <div className="text-base font-bold text-ink">Attempts &amp; mastery completion rate</div>
          </div>
          <div className="text-[11px] text-ink-dim flex gap-3">
            <Dot color="#22D3EE" /> Attempts
            <Dot color="#A855F7" /> Mastery %
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attemptData} margin={{ left: -20, right: 0, top: 10, bottom: 30 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#8C90AE", fontSize: 10 }} interval={0} angle={-12} dy={10} />
              <YAxis tick={{ fill: "#8C90AE", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#0F1430", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, fontSize: 12 }}
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
              />
              <Bar dataKey="attempts" fill="#22D3EE" radius={[6, 6, 0, 0]} />
              <Bar dataKey="mastery"  fill="#A855F7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel rounded-2xl p-5">
        <div className="text-[10px] uppercase tracking-widest text-ink-dim">Aggregate concept mastery</div>
        <div className="text-base font-bold text-ink">Cohort distribution</div>
        <div className="h-72 -mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="40%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={8} />
              <Tooltip contentStyle={{ background: "#0F1430", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, fontSize: 12 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px] -mt-4">
          {radialData.map((r) => (
            <Legend key={r.name} color={r.fill} l={r.name} v={`${r.value}%`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-flex items-center gap-1.5">
    <span className="size-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
  </span>;
}

function Legend({ color, l, v }: { color: string; l: string; v: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-sm" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="text-ink-dim">{l}</span>
      </div>
      <div className="font-mono text-ink">{v}</div>
    </div>
  );
}
