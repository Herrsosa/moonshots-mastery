import { Flame } from "lucide-react";

export function StreakFlame({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <Flame size={26} className="text-orange-400" strokeWidth={2.2}
          style={{ filter: "drop-shadow(0 0 8px rgba(251,146,60,0.7))" }} />
      </div>
      <div className="leading-tight">
        <div className="text-2xl font-bold text-orange-300 font-mono">{days}</div>
        <div className="text-[10px] uppercase tracking-widest text-orange-200/70">days</div>
      </div>
    </div>
  );
}
