-- BetterMe MVP — Supabase Schema

-- Goals
create table goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  name        text not null,
  category    text not null,
  frequency   text not null check (frequency in ('daily','weekly','monthly')),
  type        text not null default 'binary' check (type in ('binary','numeric')),
  target      numeric,
  weekdays_only boolean default false,
  streak      integer default 0,
  shield_count integer default 0,
  archived    boolean default false,
  created_at  timestamptz default now()
);
alter table goals enable row level security;
create policy "Users manage own goals" on goals for all using (auth.uid() = user_id);

-- Completions
create table completions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  goal_id     uuid references goals on delete cascade not null,
  value       numeric default 1,
  completed_at timestamptz default now(),
  period_key  text not null -- e.g. '2026-03-07' for daily, '2026-W10' for weekly
);
alter table completions enable row level security;
create policy "Users manage own completions" on completions for all using (auth.uid() = user_id);
create unique index completions_unique on completions (goal_id, period_key);

-- Journal entries
create table journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  goal_id     uuid references goals on delete cascade not null,
  goal_name   text not null,
  category    text not null,
  note        text not null,
  created_at  timestamptz default now()
);
alter table journal_entries enable row level security;
create policy "Users manage own journal" on journal_entries for all using (auth.uid() = user_id);

-- User profiles (workday + reminder prefs)
create table profiles (
  id            uuid primary key references auth.users,
  workday_preset text default 'mon-fri',
  workdays      integer[] default '{1,2,3,4,5}',
  reminder_time text default '08:00',
  created_at    timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
