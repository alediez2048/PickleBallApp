# Supabase Migration Guide

This guide provides instructions for setting up the Supabase backend for the PickleBall App.

## Prerequisites

- Supabase account (https://supabase.io)
- Supabase CLI installed (`npm install -g supabase`)
- Docker (for local development)

## Setup Steps

### 1. Create a Supabase Project

1. Login to your Supabase account and create a new project
2. Note your project URL and anon key

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Apply Database Migrations

#### Option 1: Using the Supabase UI

1. Navigate to SQL Editor in your Supabase dashboard
2. Open `scripts/supabase/migrations/001_initial_schema.sql`
3. Copy the contents and paste into the SQL Editor
4. Run the script

#### Option 2: Using Supabase CLI (Local Development)

```bash
# Start the local Supabase instance
npx supabase start

# Apply migrations
npx supabase db push --db-url postgres://postgres:postgres@localhost:54322/postgres
```

### 4. Initialize Storage Buckets

The application will automatically create the necessary storage buckets when it runs in development mode. However, for production, you need to manually create them:

1. Go to Storage in your Supabase dashboard
2. Create the following buckets:
   - `profile-images`
   - `game-images`
   - `location-images`
3. Set appropriate permissions for each bucket (usually RLS enabled)

## Seeding Test Data

For testing and development, you can seed the database with sample data:

```bash
# Run from project root
node scripts/supabase/seed.js
```

## Testing the Connection

After setting up, you can test the connection by running:

```bash
# From project root
npx expo start
```

The app should connect to Supabase and log a success message in the console.

## Troubleshooting

### Authentication Issues

- Check that your environment variables are correctly set
- Verify your Supabase project is active
- Check that RLS policies are correctly configured

### Storage Issues

- Ensure storage buckets exist with correct names
- Check that RLS policies allow the required operations
- Verify file size limits are appropriate

### Database Errors

- Review the migration logs for any SQL errors
- Check that all required tables are created
- Verify RLS policies are configured correctly

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/) 