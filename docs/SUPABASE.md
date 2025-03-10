# Supabase Implementation Guide

This document provides an overview of how Supabase is integrated into the Pickleball App.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Authentication](#authentication)
3. [Database Schema](#database-schema)
4. [Security Policies](#security-policies)
5. [Services](#services)
6. [Real-Time Features](#real-time-features)
7. [React Query Integration](#react-query-integration)
8. [Deployment](#deployment)

## Project Setup

The Supabase client is initialized in `app/config/supabase.ts`. It uses environment variables from `.env` file:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get environment variables from Expo's Constants
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' 
      ? AsyncStorage 
      : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Environment variables are configured in `app.config.js`:

```javascript
export default ({ config }) => {
  return {
    ...config,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      // ... other variables
    },
  };
};
```

## Authentication

Authentication is handled through the `AuthProvider` in `app/context/AuthContext.tsx`. This provider:

- Manages user authentication state
- Provides login, signup, and logout functions
- Syncs with the user's profile data
- Listens for auth state changes

Usage example:

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  // Use auth functions and state
}
```

## Database Schema

The database schema is defined in SQL migration files in `app/db/migrations/`:

1. `01_initial_schema.sql` - Creates the initial tables:
   - `profiles` - User profiles linked to auth.users
   - `courts` - Pickleball courts
   - `bookings` - Court bookings
   - `games` - Games associated with bookings
   - `game_participants` - Players in games

2. `02_security_policies.sql` - Sets up Row Level Security policies

## Security Policies

Row Level Security (RLS) is implemented to secure the database:

- Users can only view/modify their own profiles
- Anyone can view courts, but only admins can modify them
- Users can only create/modify/delete their own bookings
- Users can only join/leave games they're participating in

## Services

Service modules provide a clean API for database operations:

- `app/services/auth.ts` - Authentication operations
- `app/services/courtService.ts` - Court CRUD operations
- `app/services/bookingService.ts` - Booking management
- `app/services/gameService.ts` - Game and participant management
- `app/services/realtimeService.ts` - Real-time subscriptions

## Real-Time Features

Real-time features are implemented using Supabase's Realtime functionality:

- `useGameUpdates` hook - Subscribe to game and participant changes
- `useBookingUpdates` hook - Subscribe to booking changes
- `createSubscription` function - Create custom subscriptions

Example usage:

```typescript
import { useGameUpdates } from '../services/realtimeService';

function GameScreen({ gameId }) {
  const { game, participants, loading, error } = useGameUpdates(gameId);
  
  // Use real-time data
}
```

## React Query Integration

React Query is used for data fetching, caching, and state management:

- `app/hooks/useSupabaseQuery.ts` - Custom hooks for Supabase queries
- Provides hooks for all major entities (courts, bookings, games)
- Handles loading, error states, and data refetching

Example usage:

```typescript
import { useUserBookings } from '../hooks/useSupabaseQuery';

function BookingsScreen() {
  const { data: bookings, isLoading, error } = useUserBookings(userId);
  
  // Use the data
}
```

## Deployment

### Production Setup

1. Create a production Supabase project
2. Set up environment variables for production
3. Run migrations against the production database

### Database Migrations

Use the Supabase CLI to manage migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Generate migration files
supabase db diff -f migration_name

# Apply migrations
supabase db push
```

### Monitoring and Maintenance

- Enable point-in-time recovery in Supabase dashboard
- Set up regular backups
- Monitor database usage and performance through the Supabase dashboard 