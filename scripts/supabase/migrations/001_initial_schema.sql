-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for consistent values
CREATE TYPE skill_level_type AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Open');
CREATE TYPE game_status_type AS ENUM ('Upcoming', 'InProgress', 'Completed', 'Cancelled');
CREATE TYPE participant_status_type AS ENUM ('Registered', 'Cancelled', 'Attended', 'NoShow');
CREATE TYPE payment_status_type AS ENUM ('Pending', 'Completed', 'Refunded');
CREATE TYPE membership_status_type AS ENUM ('Active', 'Cancelled', 'Expired');
CREATE TYPE membership_interval_type AS ENUM ('month', 'year');
CREATE TYPE game_result_type AS ENUM ('Win', 'Loss', 'Draw');
CREATE TYPE transaction_status_type AS ENUM ('Succeeded', 'Failed', 'Refunded');
CREATE TYPE transaction_type_enum AS ENUM ('Game', 'Membership');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    skill_level skill_level_type,
    phone_number TEXT,
    date_of_birth DATE,
    profile_image_url TEXT,
    has_completed_profile BOOLEAN NOT NULL DEFAULT FALSE,
    waiver_accepted BOOLEAN DEFAULT FALSE,
    waiver_signed_at TIMESTAMP WITH TIME ZONE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create addresses table
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    description TEXT,
    amenities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    max_players INTEGER NOT NULL,
    skill_level skill_level_type NOT NULL,
    price INTEGER NOT NULL, -- Price in cents
    image_url TEXT,
    status game_status_type NOT NULL DEFAULT 'Upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create game participants junction table
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status participant_status_type NOT NULL DEFAULT 'Registered',
    payment_status payment_status_type NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(game_id, user_id) -- Prevent duplicate registrations
);

-- Create membership plans table
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price INTEGER NOT NULL, -- Price in cents
    interval membership_interval_type NOT NULL,
    benefits TEXT[] NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider_payment_id TEXT NOT NULL,
    card_last4 TEXT NOT NULL,
    card_brand TEXT NOT NULL,
    expiry_month TEXT NOT NULL,
    expiry_year TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user memberships table
CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    status membership_status_type NOT NULL DEFAULT 'Active',
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id) -- A user can only have one active membership at a time
);

-- Create payment transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    status transaction_status_type NOT NULL,
    type transaction_type_enum NOT NULL,
    reference_id UUID, -- Game ID or Membership ID
    provider_transaction_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_updates_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    match_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id) -- One preferences record per user
);

-- Create game ratings table
CREATE TABLE game_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(game_id, user_id) -- User can only rate a game once
);

-- Create user game history table
CREATE TABLE user_game_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    result game_result_type NOT NULL,
    score TEXT,
    opponent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create healthcheck table for connection testing
CREATE TABLE healthcheck (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_game_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profiles" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Addresses: users can only see and manage their own addresses
CREATE POLICY "Users can view their own addresses" 
    ON addresses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
    ON addresses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
    ON addresses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
    ON addresses FOR DELETE 
    USING (auth.uid() = user_id);

-- Payment methods: users can only see and manage their own payment methods
CREATE POLICY "Users can view their own payment methods" 
    ON payment_methods FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
    ON payment_methods FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
    ON payment_methods FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
    ON payment_methods FOR DELETE 
    USING (auth.uid() = user_id);

-- Games: all users can view games
CREATE POLICY "Games are viewable by everyone" 
    ON games FOR SELECT 
    USING (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_addresses_modtime
    BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_locations_modtime
    BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_games_modtime
    BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_game_participants_modtime
    BEFORE UPDATE ON game_participants
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_membership_plans_modtime
    BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payment_methods_modtime
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_memberships_modtime
    BEFORE UPDATE ON user_memberships
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_payment_transactions_modtime
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_preferences_modtime
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_game_ratings_modtime
    BEFORE UPDATE ON game_ratings
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_game_history_modtime
    BEFORE UPDATE ON user_game_history
    FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 