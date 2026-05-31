"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Loader2, Headphones, Brain, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { MicLogo } from "@/components/primitives/MicLogo";

/**
 * AuthGate — the app requires sign-in before use WHEN accounts are configured.
 *
 *   - Supabase not configured  → pass through (local-only mode, no gate).
 *   - Session still loading     → branded splash.
 *   - Signed out                → full-screen sign-in landing (magic link).
 *   - Signed in                 → the app.
 *
 * Sign-in first, then the app + your synced progress.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, user } = useAuth();

  if (!enabled) return <>{children}</>;          // local mode — never lock the user out
  if (loading) return <Splash />;
  if (!user) return <SignInLanding />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="relative z-10 min-h-screen grid place-items-center">
      <div className="flex flex-col items-center gap-3 text-ink-dim">
        <MicLogo size={48} />
        <Loader2 size={18} className="animate-spin text-cyan-300" />
      </div>
    </div>
  );
}

function SignInLanding() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    setError(null);
    const err = await signInWithEmail(email.trim());
    if (err) { setError(err); setStatus("error"); }
    else setStatus("sent");
  }

  return (
    <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
      {/* Left: pitch */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 gap-8">
        <div className="flex items-center gap-3">
          <MicLogo size={48} />
          <div>
            <div className="text-2xl font-bold text-gradient-cyber leading-tight">MoonshotsMastery</div>
            <div className="text-sm text-ink-dim">Master the Moonshots feed</div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-ink leading-tight max-w-md">
          Turn every episode into knowledge you actually keep.
        </h1>
        <ul className="space-y-4 max-w-md">
          <Feat icon={<Headphones size={18} className="text-cyan-300" />} title="Pick any episode" body="A chronological timeline of every Moonshots episode — master them in any order." />
          <Feat icon={<Brain size={18} className="text-purple-300" />} title="Prove you got it" body="A 5-question AI oral exam grades your reasoning, not just recall." />
          <Feat icon={<Trophy size={18} className="text-emerald-300" />} title="Master it — permanently" body="Score 80+ and it's mastered for good. Your progress syncs across devices." />
        </ul>
      </div>

      {/* Right: sign-in card */}
      <div className="grid place-items-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel rounded-3xl w-full max-w-sm p-7"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(34,211,238,0.2)" }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <MicLogo size={40} />
            <div>
              <div className="text-lg font-bold text-gradient-cyber leading-tight">MoonshotsMastery</div>
              <div className="text-[11px] text-ink-dim">Master the Moonshots feed</div>
            </div>
          </div>

          {status === "sent" ? (
            <div className="text-center py-2">
              <div className="size-14 mx-auto rounded-2xl bg-emerald-500/15 grid place-items-center mb-4" style={{ boxShadow: "0 0 24px rgba(16,185,129,0.4)" }}>
                <Check size={26} className="text-emerald-300" />
              </div>
              <h2 className="text-xl font-bold text-ink">Check your inbox</h2>
              <p className="mt-2 text-sm text-ink-dim leading-relaxed">
                We sent a magic sign-in link to <span className="text-ink font-medium">{email}</span>. Click it to enter — no password needed.
              </p>
              <button onClick={() => setStatus("idle")} className="mt-5 text-sm text-cyan-200 hover:text-cyan-100">Use a different email</button>
            </div>
          ) : (
            <>
              <div className="size-14 rounded-2xl bg-cyan-500/15 grid place-items-center mb-4" style={{ boxShadow: "0 0 24px rgba(34,211,238,0.35)" }}>
                <Mail size={26} className="text-cyan-200" />
              </div>
              <h2 className="text-2xl font-bold text-ink leading-tight">Sign in to start</h2>
              <p className="mt-1.5 text-sm text-ink-dim leading-relaxed">
                Enter your email for a passwordless link. Your mastery, streak, and progress are saved to your account.
              </p>
              <form onSubmit={submit} className="mt-5">
                <input
                  type="email" required autoFocus value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-bg-card/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                />
                {error && <p className="mt-2 text-[12px] text-red-300">{error}</p>}
                <button
                  type="submit" disabled={status === "sending"}
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
      </div>
    </div>
  );
}

function Feat({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="size-9 rounded-xl panel-soft grid place-items-center shrink-0">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="text-[13px] text-ink-dim leading-snug">{body}</div>
      </div>
    </li>
  );
}
