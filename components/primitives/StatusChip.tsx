import { cn } from "@/lib/cn";
import type { NodeStatus } from "@/lib/types";

const STYLES: Record<NodeStatus, string> = {
  available:   "border-purple-400/50 text-purple-200 bg-purple-500/10 ring-neon-purple",
  in_progress: "border-cyan-400/50 text-cyan-200 bg-cyan-500/10 ring-neon-cyan",
  mastered:    "border-emerald-400/50 text-emerald-200 bg-emerald-500/10 ring-neon-green",
};

const LABEL: Record<NodeStatus, string> = {
  available: "NOT YET",
  in_progress: "IN PROGRESS",
  mastered: "MASTERED",
};

export function StatusChip({ status, className }: { status: NodeStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wider border",
        STYLES[status],
        className
      )}
    >
      {LABEL[status]}
    </span>
  );
}
