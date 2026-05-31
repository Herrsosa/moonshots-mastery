"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TreePine, Target, CheckCircle2, BarChart3, PieChart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";

const TABS = [
  { href: "/",          label: "Map",      icon: TreePine, key: "tree" },
  { href: "/missions",  label: "Missions", icon: Target,   key: "missions" },
  { href: "/check",     label: "Check",    icon: CheckCircle2, key: "check" },
  { href: "/progress",  label: "Progress", icon: BarChart3, key: "progress" },
  { href: "/analytics", label: "Analytics",icon: PieChart, key: "analytics" },
];

export function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const missions = useStore((s) => s.missions);

  // Hide the tab bar inside the mastery check — the input would otherwise be covered
  if (pathname.match(/\/mission\/[^/]+\/check$/)) return null;

  const goToActiveCheck = () => {
    const inProgress = ALL_MISSIONS.find((m) => missions[m.id] && missions[m.id].score < 80);
    const untouched = ALL_MISSIONS.find((m) => !missions[m.id]);
    const target = inProgress ?? untouched ?? ALL_MISSIONS[0];
    router.push(`/mission/${target.id}/check`);
  };

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 panel rounded-2xl px-2 py-1.5 flex justify-between">
      {TABS.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        const Icon = t.icon;
        const handleClick = (e: React.MouseEvent) => {
          if (t.key === "check") {
            e.preventDefault();
            goToActiveCheck();
          }
        };
        return (
          <Link
            key={t.href}
            href={t.href}
            onClick={handleClick}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px]",
              active ? "text-cyan-200" : "text-ink-dim"
            )}
          >
            <Icon
              size={20}
              strokeWidth={2.2}
              style={active ? { filter: "drop-shadow(0 0 8px rgba(34,211,238,0.7))" } : undefined}
            />
            <span className="font-medium">{t.label}</span>
            {active && <span className="h-1 w-1 rounded-full bg-cyan-300" />}
          </Link>
        );
      })}
    </nav>
  );
}
