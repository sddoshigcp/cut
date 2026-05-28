
-- =========================================================
-- EXTENSIONS
-- =========================================================

create extension if not exists "pgcrypto";


-- =========================================================
-- PROFILES
-- =========================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text not null unique,

  created_at timestamp with time zone default now()
);


-- =========================================================
-- DAILY ENTRIES
-- =========================================================

create table daily_entries (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  entry_date date not null,

  distance_miles numeric(6,2),
  steps integer,
  protein_grams integer,
  bodyweight_lbs numeric(5,2),

  vitamin boolean default false,
  protein_shake boolean default false,
  lift boolean default false,
  softball boolean default false,

  created_at timestamp with time zone default now(),

  unique(user_id, entry_date)
);


-- =========================================================
-- WORKOUT ENTRIES
-- =========================================================

create table workout_entries (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references profiles(id) on delete cascade,

  workout_date date not null,

  exercise text not null,

  weight_lbs numeric(6,2),
  reps integer,

  distance_miles numeric(6,2),

  duration_minutes integer,

  calories integer,

  created_at timestamp with time zone default now()
);


-- =========================================================
-- ENABLE RLS
-- =========================================================

alter table profiles enable row level security;

alter table daily_entries enable row level security;

alter table workout_entries enable row level security;


-- =========================================================
-- PROFILES POLICIES
-- =========================================================

-- Everyone can read profiles

create policy "Profiles are viewable by everyone"
on profiles
for select
using (true);


-- Users can insert their own profile

create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);


-- Users can update their own profile

create policy "Users can update own profile"
on profiles
for update
using (auth.uid() = id);


-- Users can delete their own profile

create policy "Users can delete own profile"
on profiles
for delete
using (auth.uid() = id);


-- =========================================================
-- DAILY ENTRIES POLICIES
-- =========================================================

-- Everyone can read all daily entries

create policy "Daily entries are viewable by everyone"
on daily_entries
for select
using (true);


-- Users can insert their own entries

create policy "Users can insert own daily entries"
on daily_entries
for insert
with check (auth.uid() = user_id);


-- Users can update their own entries

create policy "Users can update own daily entries"
on daily_entries
for update
using (auth.uid() = user_id);


-- Users can delete their own entries

create policy "Users can delete own daily entries"
on daily_entries
for delete
using (auth.uid() = user_id);


-- =========================================================
-- WORKOUT ENTRIES POLICIES
-- =========================================================

-- Everyone can read all workout entries

create policy "Workout entries are viewable by everyone"
on workout_entries
for select
using (true);


-- Users can insert their own workout entries

create policy "Users can insert own workout entries"
on workout_entries
for insert
with check (auth.uid() = user_id);


-- Users can update their own workout entries

create policy "Users can update own workout entries"
on workout_entries
for update
using (auth.uid() = user_id);


-- Users can delete their own workout entries

create policy "Users can delete own workout entries"
on workout_entries
for delete
using (auth.uid() = user_id);


-- =========================================================
-- AUTO CREATE PROFILE ON SIGNUP
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );

  return new;

end;
$$;


create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

