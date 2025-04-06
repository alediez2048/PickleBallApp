create table public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  city text,
  state text,
  zip_code text,
  coordinates jsonb,
  -- { latitude, longitude }
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);