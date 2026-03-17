-- ============================================================
-- MindWell — Supabase SQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (usually enabled by default)
create extension if not exists "uuid-ossp";

-- ── Profiles ─────────────────────────────────────────────────
-- Extended user profile data (linked to auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  age           integer,
  blood_group   text,
  weight_kg     numeric,
  allergies     text,
  medical_history text,
  avatar_url    text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Mood Logs ─────────────────────────────────────────────────
create table if not exists public.mood_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  mood        text not null,         -- 'amazing','good','okay','down','stressed'
  mood_score  integer,               -- 1-5 numeric score
  note        text default '',       -- optional journal note
  logged_at   timestamptz default now()
);
create index if not exists mood_logs_user_id_idx on public.mood_logs(user_id);
create index if not exists mood_logs_logged_at_idx on public.mood_logs(logged_at desc);

-- ── Gratitude Entries ─────────────────────────────────────────
create table if not exists public.gratitude_entries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);
create index if not exists gratitude_user_id_idx on public.gratitude_entries(user_id);

-- ── Emergency Contacts ────────────────────────────────────────
create table if not exists public.emergency_contacts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  phone       text not null,
  created_at  timestamptz default now()
);
create index if not exists ec_user_id_idx on public.emergency_contacts(user_id);

-- ── BP Readings ───────────────────────────────────────────────
create table if not exists public.bp_readings (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  systolic    integer not null,
  diastolic   integer not null,
  pulse       integer,
  status      text,    -- 'NORMAL','ELEVATED','HIGH (Stage 1)','HIGH (Stage 2)','CRISIS'
  recorded_at timestamptz default now()
);
create index if not exists bp_user_id_idx on public.bp_readings(user_id);

-- ── Breathing Sessions ────────────────────────────────────────
create table if not exists public.breathing_sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  duration_seconds integer,
  technique   text default '4-4-4',
  completed_at timestamptz default now()
);

-- ============================================================
-- Row-Level Security (RLS)
-- Each user can only see and edit their own data
-- ============================================================

alter table public.profiles enable row level security;
alter table public.mood_logs enable row level security;
alter table public.gratitude_entries enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.bp_readings enable row level security;
alter table public.breathing_sessions enable row level security;

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Mood Logs
drop policy if exists "Users can view own mood logs" on public.mood_logs;
drop policy if exists "Users can insert own mood logs" on public.mood_logs;
drop policy if exists "Users can manage own mood logs" on public.mood_logs;
create policy "Users can manage own mood logs" on public.mood_logs
  for all using (auth.uid() = user_id);

-- Gratitude
drop policy if exists "Users can view own gratitude" on public.gratitude_entries;
drop policy if exists "Users can insert own gratitude" on public.gratitude_entries;
drop policy if exists "Users can manage own gratitude" on public.gratitude_entries;
create policy "Users can manage own gratitude" on public.gratitude_entries
  for all using (auth.uid() = user_id);

-- Emergency Contacts
drop policy if exists "Users can manage own contacts" on public.emergency_contacts;
create policy "Users can manage own contacts" on public.emergency_contacts
  for all using (auth.uid() = user_id);

-- BP Readings
drop policy if exists "Users can manage own BP readings" on public.bp_readings;
create policy "Users can manage own BP readings" on public.bp_readings
  for all using (auth.uid() = user_id);

-- Breathing Sessions
drop policy if exists "Users can manage own sessions" on public.breathing_sessions;
create policy "Users can manage own sessions" on public.breathing_sessions
  for all using (auth.uid() = user_id);
