"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { ALL_MISSIONS } from "@/content/missions";

/**
 * Mastery-check entry point. Routes the user to the freshest in-progress mission
 * (or first unattempted), so the sidebar/mobile shortcut feels personal — not
 * "always jump to the first mission".
 */
export default function CheckIndex() {
  const router = useRouter();
  const missions = useStore((s) => s.missions);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const inProgress = ALL_MISSIONS.find((m) => missions[m.id] && missions[m.id].score < 80);
    const untouched = ALL_MISSIONS.find((m) => !missions[m.id]);
    const target = inProgress ?? untouched ?? ALL_MISSIONS[0];
    router.replace(`/mission/${target.id}/check`);
  }, [hydrated, missions, router]);

  return (
    <div className="px-8 py-16 text-center text-ink-dim text-sm">Loading your next mastery check…</div>
  );
}
