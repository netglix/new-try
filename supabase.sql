-- EScope – Supabase SQL schema
-- Run this in the Supabase SQL editor (Dashboard → SQL editor → New query)

-- ── Table ────────────────────────────────────────────────────────────────────
create table if not exists public.es_history (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  company       text not null,
  es_text       text not null,
  analysis_result jsonb not null
);

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table public.es_history enable row level security;

-- Users can only read their own rows
create policy "Users can read own history"
  on public.es_history
  for select
  using (auth.uid() = user_id);

-- Users can only insert rows for themselves
create policy "Users can insert own history"
  on public.es_history
  for insert
  with check (auth.uid() = user_id);

-- Users can delete their own rows (optional but handy)
create policy "Users can delete own history"
  on public.es_history
  for delete
  using (auth.uid() = user_id);
