"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Brain, Trophy, ArrowRight, X } from "lucide-react";

/**
 * Onboarding.
 *
 * Explains the app in 3 plain-language steps. Auto-opens once (first run) and
 * ONLY on the home route — it never interrupts a direct deep-link into a mission
 * detail or check. After dismissal it's persisted and reachable on demand via
 * the "How this works" button (which fires a `pm:open-onboarding` event).
 */

const STORAGE_KEY = "pm:onboarded:v1";

const STEPS = [
  {
    icon: Headphones,
    color: "#22D3EE",
    title: "You already listen to podcasts.",
    body: "But how much actually sticks? Most of it fades within a week. This app turns that listening into knowledge you can actually use.",
  },
  {
    icon: Brain,
    color: "#A855F7",
    title: "Pick any episode. Prove you got it.",
    body: "Open any episode on the timeline. An AI tutor asks you 5 questions — applying and connecting the ideas, not just recalling numbers — and grades your reasoning.",
  },
  {
    icon: Trophy,
    color: "#34D399",
    title: "Master it — permanently.",
    body: "Score 80+ and the episode is mastered for good. Build a streak, watch the big threads evolve over time, and turn a feed into durable knowledge.",
  },
];

export function Onboarding() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-open once, ONLY on the home route — never over a deep-linked mission.
  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "true") {
        const t = setTimeout(() => setOpen(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      /* SSR / disabled storage — silently skip */
    }
  }, [pathname]);

  // Allow any "How this works" affordance to reopen it on demand.
  useEffect(() => {
    const reopen = () => { setStep(0); setOpen(true); };
    window.addEventListener("pm:open-onboarding", reopen);
    return () => window.removeEventListener("pm:open-onboarding", reopen);
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  }

  if (!open) return null;
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center px-4"
        style={{ background: "rgba(5, 6, 12, 0.78)", backdropFilter: "blur(10px)" }}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          className="relative panel rounded-3xl w-full max-w-md p-7 md:p-8"
          style={{
            boxShadow: `0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px ${s.color}33`,
          }}
        >
          {/* Soft color glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            aria-hidden
            style={{
              background: `radial-gradient(circle at 30% 0%, ${s.color}26, transparent 60%)`,
              filter: "blur(16px)",
            }}
          />

          {/* Skip / close */}
          <button
            onClick={dismiss}
            aria-label="Skip onboarding"
            className="absolute top-3 right-3 size-8 grid place-items-center rounded-lg text-ink-dim hover:text-ink hover:bg-white/5 transition"
          >
            <X size={16} />
          </button>

          <div className="relative">
            {/* Icon */}
            <div
              className="size-14 rounded-2xl grid place-items-center mb-4"
              style={{
                background: `${s.color}22`,
                boxShadow: `0 0 24px ${s.color}55, inset 0 0 0 1px ${s.color}55`,
              }}
            >
              <Icon size={26} style={{ color: s.color }} />
            </div>

            {/* Step pill */}
            <div className="text-[10px] uppercase tracking-[0.22em] text-ink-dim font-semibold mb-2">
              Step {step + 1} of {STEPS.length}
            </div>

            <h2 className="text-2xl font-bold text-ink leading-tight mb-3">{s.title}</h2>
            <p className="text-sm text-ink-dim leading-relaxed">{s.body}</p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === step ? 28 : 14,
                    background: i <= step ? s.color : "rgba(255,255,255,0.12)",
                    boxShadow: i === step ? `0 0 10px ${s.color}` : "none",
                  }}
                />
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-6 flex items-center gap-2">
              <button
                onClick={next}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-semibold text-sm text-bg-deep transition active:scale-[0.98]"
                style={{
                  background: `linear-gradient(90deg, ${s.color}, ${STEPS[(step + 1) % STEPS.length].color})`,
                  boxShadow: `0 8px 24px ${s.color}55`,
                }}
              >
                {isLast ? "Start exploring" : "Next"}
                <ArrowRight size={16} />
              </button>
              {!isLast && (
                <button
                  onClick={dismiss}
                  className="text-xs text-ink-dim hover:text-ink px-3 py-2 transition"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
