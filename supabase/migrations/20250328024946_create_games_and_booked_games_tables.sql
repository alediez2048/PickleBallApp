-- Create "games" table
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location jsonb not null,
  -- { address, area, city, etc. }
  host jsonb not null,
  -- snapshot of User object
  players jsonb,
  -- array of users (snapshot)
  registered_count integer default 0,
  max_players integer not null,
  skill_level text not null,
  price numeric not null,
  image_url text,
  status text not null check (status in ('upcoming', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
-- Create "booked_games" table
create table public.booked_games (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null references public.games(id) on delete cascade,
  date date not null,
  time time not null,
  court_name text not null,
  location jsonb not null,
  -- { address, area, city }
  skill_rating integer not null,
  price numeric not null,
  status text not null check (status in ('upcoming', 'completed', 'cancelled')),
  user_id uuid references public.users(id) on delete
  set null,
    user_info jsonb,
    -- snapshot of User object at booking time
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);