-- Enable the uuid-ossp extension for UUID generation
create extension if not exists "uuid-ossp";
-- =====================================
-- Normalize "locations" table
-- =====================================
create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  state text,
  zip_code text,
  coordinates jsonb,
  -- Structure: { "latitude": ..., "longitude": ... }
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
-- =====================================
-- Update "games" table to use location_id
-- =====================================
alter table public.games drop column if exists location;
alter table public.games
add column location_id uuid references public.locations(id) on delete
set null;
-- =====================================
-- Update "booked_games" table to use location_id
-- =====================================
alter table public.booked_games drop column if exists location;
alter table public.booked_games
add column location_id uuid references public.locations(id) on delete
set null;
-- =====================================
-- Create "fixed_games" table
-- =====================================
create table public.fixed_games (
  id uuid primary key default uuid_generate_v4(),
  -- Game details
  title text not null,
  description text,
  -- Fixed schedule fields
  day_of_week text not null check (
    day_of_week in (
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    )
  ),
  start_time time not null,
  duration_minutes integer not null,
  -- Foreign key to locations
  location_id uuid not null references public.locations(id) on delete cascade,
  -- Host and participation
  host jsonb not null,
  -- Snapshot of the user who created/hosts the game
  max_players integer not null,
  skill_level text not null,
  price numeric not null,
  -- Media and status
  image_url text,
  status text not null check (status in ('active', 'inactive')),
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);