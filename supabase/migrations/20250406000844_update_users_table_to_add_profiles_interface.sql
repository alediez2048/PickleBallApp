-- Add missing columns from `profiles` into `users`
alter table public.users -- Profile status and display-related
add column status text not null default 'incomplete' check (
    status in ('incomplete', 'active', 'suspended', 'deleted')
  ),
  add column display_name text,
  add column bio text,
  add column visibility text check (
    visibility in ('public', 'private', 'friends-only')
  ),
  add column avatar_url text,
  -- Game and skill-related
add column playing_experience integer,
  add column preferred_play_style text check (
    preferred_play_style in ('singles', 'doubles', 'both')
  ),
  add column availability jsonb,
  -- Membership-specific
add column membership_tier text check (
    membership_tier in (
      'drop-in',
      'monthly',
    )
  ),
  add column membership_start_date date,
  add column membership_end_date date,
  -- Stats and preferences
add column stats jsonb,
  add column preferences jsonb,
  -- Legal agreements
add column waiver_accepted boolean default false,
  add column waiver_signed_at timestamp with time zone,
  add column terms_accepted boolean default false,
  add column terms_accepted_at timestamp with time zone,
  add column privacy_policy_accepted boolean default false,
  add column privacy_policy_accepted_at timestamp with time zone,
  -- Activity tracking
add column last_active timestamp with time zone;