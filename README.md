# MoonshotsMastery

Turn the **Moonshots with Peter Diamandis** feed into durable knowledge. Open any
episode on the chronological timeline, take a 5-question AI oral exam, and master
it — permanently. Track how the big threads (Anthropic, compute, SpaceX, Google,
models, humanoids, longevity, markets) evolve week over week.

Built with Next.js 15 (App Router) · React 19 · Tailwind · Zustand · Framer Motion.

---

## Run locally

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

The app works with **zero configuration** — offline heuristic grading, local-only
progress, no login. Add the optional keys below to unlock the full experience.

> Windows note: if `pnpm dev` says `'next' is not recognized`, run `pnpm install`
> once with no dev server running to regenerate the binaries.

## Optional configuration (`.env.local`)

Copy `.env.example` → `.env.local`.

| Variable | Effect if set | Effect if absent |
|---|---|---|
| `OPENAI_API_KEY` | Live AI question generation + grading (gpt-4o-mini) | Falls back to a local heuristic scorer |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real magic-link accounts + cross-device progress sync | Local-only progress, no sign-in UI |

`OPENAI_API_KEY` is **server-side only** (used inside `/api/check/*` route handlers)
and never reaches the browser. The Supabase anon key is browser-safe — Row Level
Security (below) is what protects user data.

## Enabling accounts (Supabase magic link)

1. Create a free project at [supabase.com](https://supabase.com).
2. **Settings → API** → copy the Project URL and the `anon` public key into
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. **SQL Editor** → paste and run [`supabase/schema.sql`](./supabase/schema.sql)
   (creates the `user_progress` table + Row Level Security policies).
4. **Authentication → URL Configuration** → add your site URL(s) to *Redirect URLs*
   (e.g. `http://localhost:3000` and your production domain).
5. Restart `pnpm dev`. A "Sign in to save progress" button appears in the sidebar.

How sync works: on first sign-in your existing local progress is pushed to the
cloud; thereafter every change is debounce-saved, and signing in on another device
pulls it back. Mastered episodes stay mastered — there is no review debt.

## Deploy (Vercel)

1. Push to GitHub, import the repo in Vercel (root = this folder).
2. Add the same env vars in **Project → Settings → Environment Variables**.
3. Add your Vercel production URL to Supabase **Redirect URLs**.
4. Deploy. `pnpm build` runs automatically.

## Content

All 18 episodes live in `content/missions/*.ts` (one file per episode). To add a
new episode: author a `Mission` object from its transcript and export it from
`content/missions/index.ts`. Tracked threads + "what changed" notes live in
`lib/threads.ts`.
