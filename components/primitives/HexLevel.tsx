"use client";
import { useId } from "react";
import { cn } from "@/lib/cn";

export function HexLevel({ level, size = 72, className }: { level: number; size?: number; className?: string }) {
  const gradientId = useId(); // unique per instance — no SVG id collisions
  const r = size / 2;
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        <polygon
          points={points}
          fill="rgba(34,211,238,0.06)"
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.45))" }}
        />
      </svg>
      <span className="relative font-bold text-2xl text-gradient-cyber" style={{ fontSize: size * 0.36 }}>{level}</span>
    </div>
  );
}
