create table public.membership_plans (
  id text primary key,
  tier text not null check (tier in ('free', 'drop-in', 'monthly', 'basic', 'premium', 'pro')),
  name text not null,
  description text,
  price_monthly numeric default 0,
  price_annual numeric default 0,
  features jsonb,
  max_bookings_per_month integer,
  court_reservation_window integer,
  partner_matching_priority integer,
  cancellation_window integer,
  guest_passes integer,
  discounts jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
