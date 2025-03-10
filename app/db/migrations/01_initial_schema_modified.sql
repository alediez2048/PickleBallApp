-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if profiles table exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    -- Profiles table (extends Supabase auth.users)
    CREATE TABLE public.profiles (
      id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
      username TEXT UNIQUE,
      full_name TEXT,
      avatar_url TEXT,
      skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Trigger to update updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- Check if courts table exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'courts') THEN
    -- Courts table
    CREATE TABLE public.courts (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      indoor BOOLEAN DEFAULT false,
      available BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Trigger to update updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.courts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- Check if bookings table exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    -- Bookings table
    CREATE TABLE public.bookings (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      court_id UUID REFERENCES public.courts NOT NULL,
      user_id UUID REFERENCES public.profiles NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE NOT NULL,
      status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Trigger to update updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- Check if games table exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'games') THEN
    -- Games table
    CREATE TABLE public.games (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      booking_id UUID REFERENCES public.bookings NOT NULL,
      game_type TEXT CHECK (game_type IN ('singles', 'doubles')) NOT NULL,
      max_players INTEGER NOT NULL,
      current_players INTEGER DEFAULT 0,
      skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro', 'any')),
      status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Trigger to update updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END
$$;

-- Check if game_participants table exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_participants') THEN
    -- Game participants table
    CREATE TABLE public.game_participants (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      game_id UUID REFERENCES public.games NOT NULL,
      user_id UUID REFERENCES public.profiles NOT NULL,
      team TEXT CHECK (team IN ('A', 'B')),
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      
      -- Each user can only join a game once
      UNIQUE(game_id, user_id)
    );
  END IF;
END
$$;

-- Create function to update current_players count if it doesn't exist
CREATE OR REPLACE FUNCTION update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.games
    SET current_players = current_players + 1
    WHERE id = NEW.game_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.games
    SET current_players = current_players - 1
    WHERE id = OLD.game_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_player_count' 
    AND tgrelid = 'public.game_participants'::regclass
  ) THEN
    -- Trigger for player count
    CREATE TRIGGER update_player_count
    AFTER INSERT OR DELETE ON public.game_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_game_player_count();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- If game_participants table doesn't exist yet, do nothing
    NULL;
END
$$; 