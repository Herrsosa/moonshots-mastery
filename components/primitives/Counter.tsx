"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Animated number that tweens from its previous render to a new value.
 * - First mount: starts at `from` (default 0) and animates to `value`.
 * - Subsequent updates: tweens from the prior value to the new one.
 */
export function Counter({
  value, duration = 1.0, format = (n) => Math.round(n).toLocaleString(), from = 0, className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  from?: number;
  className?: string;
}) {
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (latest) => format(latest));
  const previous = useRef(from);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => { previous.current = latest; },
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return <motion.span className={className}>{rounded}</motion.span>;
}
