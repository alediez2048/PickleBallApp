# Supabase SQL Setup Guide

This document contains the SQL scripts and database schema information for setting up the Pickleball App on Supabase.

## Database Tables

### Profiles Table

The profiles table extends the auth.users information with application-specific data:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  email TEXT NOT NULL,
  name TEXT,
  display_name TEXT,
  skill_level TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  profile_image_url TEXT,
  has_completed_profile BOOLEAN DEFAULT false,
  waiver_accepted BOOLEAN DEFAULT false,
  waiver_signed_at TIMESTAMP WITH TIME ZONE,
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_policy_accepted BOOLEAN DEFAULT false,
  privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();
```

### Games Table

The games table stores information about available games:

```sql
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  country TEXT DEFAULT 'United States',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  skill_level TEXT,
  player_limit INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'upcoming',
  is_private BOOLEAN DEFAULT false,
  host_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  recurring_id UUID,
  tags TEXT[],
  metadata JSONB
);

-- Set up Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view public games
CREATE POLICY "Anyone can view public games" 
  ON public.games 
  FOR SELECT 
  USING (is_private = false);

-- Hosts can view their private games
CREATE POLICY "Hosts can view their private games" 
  ON public.games 
  FOR SELECT 
  USING (auth.uid() = host_id);

-- Hosts can update their games
CREATE POLICY "Hosts can update their games" 
  ON public.games 
  FOR UPDATE 
  USING (auth.uid() = host_id);
```

### Bookings Table

The bookings table manages user game bookings:

```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  game_id UUID NOT NULL REFERENCES public.games(id),
  status TEXT NOT NULL DEFAULT 'upcoming',
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  amount_paid DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Set up Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can insert own bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Game hosts can view bookings for their games
CREATE POLICY "Game hosts can view bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT host_id FROM public.games WHERE id = game_id
    )
  );
```

### Trigger to Update Game Player Count

```sql
CREATE OR REPLACE FUNCTION public.update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'upcoming' THEN
    -- Increment player count for new bookings
    UPDATE public.games
    SET current_players = current_players + 1
    WHERE id = NEW.game_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from upcoming to cancelled/completed, decrement
    IF OLD.status = 'upcoming' AND NEW.status != 'upcoming' THEN
      UPDATE public.games
      SET current_players = GREATEST(0, current_players - 1)
      WHERE id = NEW.game_id;
    -- If status changed from cancelled/completed to upcoming, increment
    ELSIF OLD.status != 'upcoming' AND NEW.status = 'upcoming' THEN
      UPDATE public.games
      SET current_players = current_players + 1
      WHERE id = NEW.game_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'upcoming' THEN
    -- Decrement player count for deleted upcoming bookings
    UPDATE public.games
    SET current_players = GREATEST(0, current_players - 1)
    WHERE id = OLD.game_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_game_player_count();
```

### Payment Methods Table

```sql
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payment_provider TEXT NOT NULL,
  payment_method_id TEXT NOT NULL,
  last_four TEXT,
  card_brand TEXT,
  expiry_month TEXT,
  expiry_year TEXT,
  is_default BOOLEAN DEFAULT false,
  billing_details JSONB,
  metadata JSONB
);

-- Set up Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" 
  ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own payment methods
CREATE POLICY "Users can insert own payment methods" 
  ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own payment methods
CREATE POLICY "Users can update own payment methods" 
  ON public.payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own payment methods
CREATE POLICY "Users can delete own payment methods" 
  ON public.payment_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

## Storage Buckets Setup

### Profile Images Bucket

```sql
-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name)
VALUES ('profile-images', 'Profile Images')
ON CONFLICT DO NOTHING;

-- Set up storage policy for profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Game Images Bucket

```sql
-- Create a storage bucket for game images
INSERT INTO storage.buckets (id, name)
VALUES ('game-images', 'Game Images')
ON CONFLICT DO NOTHING;

-- Set up storage policy for game images
CREATE POLICY "Anyone can view game images"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Game hosts can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Game hosts can update game images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Game hosts can delete game images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-images' AND
  auth.uid() IN (
    SELECT host_id FROM public.games 
    WHERE id::text = (storage.foldername(name))[1]
  )
);
```

## Important Supabase Functions

### Upload Profile Image Function

```typescript
export const uploadProfileImage = async (userId: string, imageData: { uri: string, base64: string, timestamp: number }): Promise<string | null> => {
  try {
    // Initialize Supabase if necessary
    await initializeSupabase();
    
    // Create file path using userId for folder structure
    const filePath = `${userId}/${Date.now()}.jpg`;
    
    // Upload the file
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .upload(filePath, decode(imageData.base64), {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL for the file
    const { data: urlData } = supabase
      .storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload profile image error:', error);
    return null;
  }
};
```

### Update Game Status Function (for scheduled tasks)

```sql
CREATE OR REPLACE FUNCTION update_game_status()
RETURNS void AS $$
BEGIN
  -- Update games that have ended to 'completed'
  UPDATE public.games
  SET status = 'completed'
  WHERE status = 'upcoming' 
    AND (date < CURRENT_DATE 
      OR (date = CURRENT_DATE AND end_time < CURRENT_TIME));
  
  -- You could add more complex logic here as needed
END;
$$ LANGUAGE plpgsql;
```

## Scheduled Jobs

To automatically update game statuses, set up a scheduled job using Supabase's pgcron extension:

```sql
-- Run every hour
SELECT cron.schedule('0 * * * *', 'SELECT update_game_status()');
```

## Notes on Data Migrations

When migrating existing data from the mock API to Supabase:

1. Export users from the mock API.
2. Use Supabase Auth Admin API to create users.
3. Insert corresponding profiles.
4. Migrate games and bookings data.
5. Verify foreign key constraints are satisfied.

Example migration script for users:

```javascript
// Example user migration script
const migrateUsers = async (mockUsers) => {
  for (const user of mockUsers) {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: 'temporary-password', // Or generate a random one
      email_confirm: true, // Skip email verification for migration
      user_metadata: {
        name: user.name
      }
    });
    
    if (authError) {
      console.error(`Error creating user ${user.email}:`, authError);
      continue;
    }
    
    // Additional profile data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: user.name,
        display_name: user.displayName,
        skill_level: user.skillLevel,
        phone_number: user.phoneNumber,
        date_of_birth: user.dateOfBirth,
        profile_image_url: user.profileImage,
        has_completed_profile: user.hasCompletedProfile || false,
      })
      .eq('id', authUser.id);
      
    if (profileError) {
      console.error(`Error updating profile for ${user.email}:`, profileError);
    }
  }
};
``` 