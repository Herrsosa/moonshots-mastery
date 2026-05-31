"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TreePine, Target, CheckCircle2, BarChart3, PieChart, HelpCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { MicLogo } from "@/components/primitives/MicLogo";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";
import { AuthButton } from "@/components/auth/AuthButton";

const NAV = [
  { href: "/",          label: "Constellation", icon: TreePine,     key: "tree" },
  { href: "/missions",  label: "Missions",      icon: Target,       key: "missions" },
  { href: "/check",     label: "Mastery Check", icon: CheckCircle2, key: "check" },
  { href: "/progress",  label: "Progress",      icon: BarChart3,    key: "progress" },
  { href: "/analytics", label: "Analytics",     icon: PieChart,     key: "analytics" },
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const missions = useStore((s) => s.missions);
  const masteredCount = Object.values(missions).filter((a) => a.score >= 80).length;

  const goToActiveCheck = () => {
    // Pick the user's freshest in-progress mission; fall back to first unattempted
    const inProgress = ALL_MISSIONS.find((m) => missions[m.id] && missions[m.id].score < 80);
    const untouched = ALL_MISSIONS.find((m) => !missions[m.id]);
    const target = inProgress ?? untouched ?? ALL_MISSIONS[0];
    router.push(`/mission/${target.id}/check`);
  };

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col gap-2 border-r border-white/5 bg-bg-base/95 px-4 py-6">
      <Link href="/" className="flex items-center gap-3 px-2 mb-4">
        <MicLogo size={40} />
        <div className="leading-tight">
          <div className="font-bold text-base text-gradient-cyber">MoonshotsMastery</div>
          <div className="text-[11px] text-ink-dim">Master the Moonshots feed</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const onClick = (e: React.MouseEvent) => {
            if (item.key === "check") {
              e.preventDefault();
              goToActiveCheck();
            }
          };
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400/60",
                active
                  ? "bg-cyan-500/10 text-cyan-200 ring-neon-cyan"
                  : "text-ink-dim hover:text-ink hover:bg-white/5"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="font-medium">{item.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-glow-cyan" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="panel rounded-xl p-4 flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-widest text-ink-dim">Episodes mastered</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gradient-mastery font-mono">{masteredCount}</span>
            <span className="text-sm text-ink-dim">/ {ALL_MISSIONS.length}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-bg-line overflow-hidden">
            <div className="h-full rounded-full" style={{
              width: `${Math.round((masteredCount / ALL_MISSIONS.length) * 100)}%`,
              background: "linear-gradient(90deg,#22D3EE,#34D399)",
              boxShadow: "0 0 12px rgba(16,185,129,0.5)",
            }} />
          </div>
        </div>
        <div className="mt-3">
          <AuthButton variant="sidebar" />
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event("pm:open-onboarding"))}
          className="mt-2 w-full panel-soft rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm text-ink hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400/60"
        >
          <HelpCircle size={16} className="text-cyan-300" />
          How this works
        </button>
      </div>
    </aside>
  );
}
