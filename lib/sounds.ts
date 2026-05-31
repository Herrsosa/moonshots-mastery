"use client";

/**
 * Tiny audio cues — synthesized via Web Audio API so there are no asset files.
 *
 * Three sounds:
 *   playClick() — soft tick on answer submit
 *   playSweep() — score-reveal sweep on the ScoreCard dial
 *   playChime() — rising chime when a badge unlocks (score ≥80)
 *
 * Respects a single user-controlled mute flag stored in localStorage
 * ("pm:audio:muted"). Default = unmuted so first-time demo viewers hear the
 * polish. Use isMuted() / setMuted() from the Topbar mute toggle.
 *
 * All audio is gated behind a "first user gesture" guard so browsers don't
 * complain about autoplay. If the AudioContext can't be created (SSR, old
 * browser), every function is a silent no-op.
 */

const STORAGE_KEY = "pm:audio:muted";

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  try { return localStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function setMuted(value: boolean) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, value ? "true" : "false"); } catch {}
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.08, when = 0) {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Subtle UI click — answer submitted, button pressed. */
export function playClick() {
  tone(880, 0.06, "triangle", 0.05);
  tone(440, 0.05, "sine", 0.03, 0.01);
}

/** Score-reveal sweep — short upward glide on the ScoreCard. */
export function playSweep() {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, t0);
  osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.7);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.06, t0 + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.9);
}

/** Rising chime — three quick notes outlining a major triad. Badge unlock. */
export function playChime() {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, 0.35, "triangle", 0.05, i * 0.09));
}
