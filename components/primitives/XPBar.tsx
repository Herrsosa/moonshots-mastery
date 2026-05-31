"use client";
import { motion } from "framer-motion";

export function XPBar({ xp, max }: { xp: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (xp / max) * 100));
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-bg-line/80 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #22D3EE 0%, #818CF8 60%, #A855F7 100%)",
            boxShadow: "0 0 18px rgba(34,211,238,0.6)",
          }}
        />
      </div>
    </div>
  );
}
