-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.game_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view courts" ON public.courts;
DROP POLICY IF EXISTS "Only admins can insert courts" ON public.courts;
DROP POLICY IF EXISTS "Only admins can update courts" ON public.courts;
DROP POLICY IF EXISTS "Only admins can delete courts" ON public.courts;

DROP POLICY IF EXISTS "Users can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Users can create games for their bookings" ON public.games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Users can delete their own games" ON public.games;

DROP POLICY IF EXISTS "Anyone can view game participants" ON public.game_participants;
DROP POLICY IF EXISTS "Users can join games" ON public.game_participants;
DROP POLICY IF EXISTS "Users can leave games they joined" ON public.game_participants;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Courts policies
CREATE POLICY "Anyone can view courts"
  ON public.courts FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert courts"
  ON public.courts FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update courts"
  ON public.courts FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete courts"
  ON public.courts FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Bookings policies
CREATE POLICY "Users can view all bookings"
  ON public.bookings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings"
  ON public.bookings FOR DELETE
  USING (auth.uid() = user_id);

-- Games policies
CREATE POLICY "Anyone can view games"
  ON public.games FOR SELECT
  USING (true);

CREATE POLICY "Users can create games for their bookings"
  ON public.games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own games"
  ON public.games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own games"
  ON public.games FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Game participants policies
CREATE POLICY "Anyone can view game participants"
  ON public.game_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join games"
  ON public.game_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave games they joined"
  ON public.game_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin; 