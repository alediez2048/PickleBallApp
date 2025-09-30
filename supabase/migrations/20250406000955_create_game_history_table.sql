create table public.game_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  date date not null,
  result text check (result in ('win', 'loss')),
  score text,
  opponent text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
