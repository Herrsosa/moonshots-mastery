"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Mail, X, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

/**
 * Sign-in / account control. Renders nothing when accounts aren't configured
 * (local-only mode) so the UI stays clean. Magic-link (passwordless) flow:
 * enter email → receive link → click → you're in.
 *
 * Listens for a global `pm:open-signin` event so other surfaces (e.g. a
 * "Sign in to save your progress" nudge) can open it.
 */
export function AuthButton({ variant = "sidebar" }: { variant?: "sidebar" | "topbar" }) {
  const { enabled, user, signInWithEmail, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener("pm:open-signin", openModal);
    return () => window.removeEventListener("pm:open-signin", openModal);
  }, []);

  if (!enabled) return null; // local-only mode — no auth UI

  return (
    <>
      {user ? (
        <button
          onClick={() => signOut()}
          title={`Signed in as ${user.email} — sign out`}
          className={
            variant === "topbar"
              ? "inline-flex items-center gap-2 panel-soft rounded-xl px-3 py-2 text-sm text-ink-dim hover:text-ink transition-colors"
              : "w-full panel-soft rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm text-ink hover:bg-white/5"
          }
        >
          <span className="size-6 rounded-full grid place-items-center bg-gradient-to-br from-cyan-500/30 to-purple-500/30 ring-1 ring-white/10 text-[10px] font-bold uppercase">
            {(user.email ?? "?").slice(0, 1)}
          </span>
          <span className="truncate flex-1 text-left">{user.email}</span>
          <LogOut size={15} className="shrink-0 text-ink-dim" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          disabled={loading}
          className={
            variant === "topbar"
              ? "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-bg-deep bg-cyan-300 hover:bg-cyan-200 transition-colors"
              : "w-full rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold text-bg-deep bg-cyan-300 hover:bg-cyan-200 transition-colors"
          }
          style={{ color: "#05060F" }}
        >
          <LogIn size={15} /> Sign in to save progress
        </button>
      )}

      <AnimatePresence>
        {open && <SignInModal onClose={() => setOpen(false)} onSubmit={signInWithEmail} />}
      </AnimatePresence>
    </>
  );
}

function SignInModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (email: string) => Promise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    setError(null);
    const err = await onSubmit(email.trim());
    if (err) {
      setError(err);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] grid place-items-center px-4"
      style={{ background: "rgba(5,6,12,0.8)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        className="relative panel rounded-3xl w-full max-w-sm p-7"
        style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(34,211,238,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 size-8 grid place-items-center rounded-lg text-ink-dim hover:text-ink hover:bg-white/5">
          <X size={16} />
        </button>

        {status === "sent" ? (
          <div className="text-center py-2">
            <div className="size-14 mx-auto rounded-2xl bg-emerald-500/15 grid place-items-center mb-4" style={{ boxShadow: "0 0 24px rgba(16,185,129,0.4)" }}>
              <Check size={26} className="text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm text-ink-dim leading-relaxed">
              We sent a magic sign-in link to <span className="text-ink font-medium">{email}</span>.
              Click it and you&apos;ll be signed in — your mastery progress will sync across devices.
            </p>
            <button onClick={onClose} className="mt-5 text-sm text-cyan-200 hover:text-cyan-100">Done</button>
          </div>
        ) : (
          <>
            <div className="size-14 rounded-2xl bg-cyan-500/15 grid place-items-center mb-4" style={{ boxShadow: "0 0 24px rgba(34,211,238,0.35)" }}>
              <Mail size={26} className="text-cyan-200" />
            </div>
            <h2 className="text-xl font-bold text-ink leading-tight">Save your mastery</h2>
            <p className="mt-1.5 text-sm text-ink-dim leading-relaxed">
              Enter your email for a passwordless sign-in link. Your progress, streak, and mastered episodes sync across every device.
            </p>
            <form onSubmit={submit} className="mt-5">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-bg-card/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
              {error && <p className="mt-2 text-[12px] text-red-300">{error}</p>}
              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(90deg,#22D3EE,#A855F7)", color: "#05060F" }}
              >
                {status === "sending" ? (<><Loader2 size={16} className="animate-spin" /> Sending…</>) : (<><Mail size={16} /> Send magic link</>)}
              </button>
            </form>
            <p className="mt-3 text-[11px] text-ink-faint text-center">No password. We never post anything.</p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
