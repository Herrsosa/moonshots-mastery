-- MoonshotsMastery — Supabase schema
-- Run this once in your Supabase project (SQL Editor → New query → paste → Run).
-- Auth (magic link) is built into Supabase; this only adds per-user progress storage.

-- One row per user holding the full progress blob (mirrors the client store slice).
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: a user can only ever see or modify their OWN row.
-- This is what makes exposing the anon key in the browser safe.
alter table public.user_progress enable row level security;

drop policy if exists "own row: select" on public.user_progress;
create policy "own row: select" on public.user_progress
  for select using (auth.uid() = user_id);

drop policy if exists "own row: insert" on public.user_progress;
create policy "own row: insert" on public.user_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "own row: update" on public.user_progress;
create policy "own row: update" on public.user_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional: also lock deletes to the owner (cascade already covers account deletion).
drop policy if exists "own row: delete" on public.user_progress;
create policy "own row: delete" on public.user_progress
  for delete using (auth.uid() = user_id);
