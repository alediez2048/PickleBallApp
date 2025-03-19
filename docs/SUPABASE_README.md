# Supabase Backend Implementation

This document serves as a comprehensive guide to the Supabase backend implementation for the Pickleball App.

## Introduction

The Pickleball App uses Supabase, an open-source Firebase alternative, as its backend platform. Supabase provides a PostgreSQL database, authentication, storage, and real-time subscriptions, making it an ideal choice for our application.

## Getting Started

### Prerequisites

- A Supabase account and project
- Environment variables configured (see below)
- Node.js and npm/yarn

### Environment Setup

Create a `.env` file (or use the Expo environment system) with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_AUTH_REDIRECT_URL=your-app-url/auth/callback
```

For local development with Expo Go:

```
# Add these to your .env file
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Architecture

The Supabase implementation follows a modular architecture:

```
src/
├── config/
│   └── supabase.ts       # Supabase client initialization
├── services/
│   └── api/
│       └── supabase/
│           ├── auth.ts    # Authentication services
│           ├── schema.ts  # Database schema types
│           ├── storage.ts # Storage services
│           └── utils.ts   # Utility functions
├── hooks/
│   └── useSupabaseAuth.ts # Custom auth hook
└── contexts/
    └── AuthContext.tsx    # Authentication context
```

## Authentication

We use Supabase Auth for user authentication. The flow works as follows:

1. User signs up or logs in
2. Supabase creates/validates the user and returns a session
3. The session contains a JWT token for API authorization
4. A profile entry is automatically created in the `profiles` table

### Platform-Specific Considerations

#### Web
- Uses redirect-based auth flow for OAuth
- Handles email confirmation via URL parameters
- Requires additional URL handling for auth callbacks

#### Mobile
- Uses deep linking for auth callbacks
- Handles session persistence differently
- Uses Expo's linking API for OAuth flows

## Database Schema

The database is structured with the following main tables:

- `profiles` - Extends auth.users with app-specific user data
- `games` - Game listings and availability
- `bookings` - User game bookings and status
- `payment_methods` - User payment information

See `SUPABASE_SQL_SETUP.md` for the complete schema.

## Row Level Security (RLS)

Each table has RLS policies to ensure proper data access:

- Users can only view/edit their own profiles
- Public games are visible to everyone, private games only to hosts
- Users can only view their own bookings
- Game hosts can view bookings for their games

## Real-time Subscriptions

Supabase Realtime is used for:

1. Profile changes: Updates the UI when user profile changes
2. Game availability: Shows real-time player count updates
3. Booking status: Notifies users of booking status changes

Example usage:

```typescript
// Subscribe to profile changes
const profileChannel = supabase
  .channel(`public:profiles:id=eq.${userId}`)
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'profiles',
    filter: `id=eq.${userId}`
  }, (payload) => {
    // Handle profile update
  })
  .subscribe();

// Clean up subscription
return () => {
  profileChannel.unsubscribe();
};
```

## Storage

Supabase Storage is used for:

1. Profile images - Stored in the `profile-images` bucket
2. Game images - Stored in the `game-images` bucket

Files are organized by user ID to maintain access control.

## Error Handling

A centralized error handling approach is used:

```typescript
export const handleSupabaseError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    const supabaseError = error as any;
    if (supabaseError.message) {
      return new Error(supabaseError.message);
    }
    if (supabaseError.error_description) {
      return new Error(supabaseError.error_description);
    }
  }
  
  return new Error('Unknown error occurred');
};
```

## Testing

For testing with Supabase:

1. Use a dedicated test project to avoid affecting production data
2. Mock Supabase services in unit tests
3. Use integration tests for auth flows, database operations, and real-time features

## Deployment Considerations

### Web

- Ensure proper CORS configuration in Supabase
- Configure redirect URLs for authentication
- Handle URL-based authentication flows

### Mobile

- Configure deep linking in your app.json
- Set up proper associated domains for iOS
- Handle app-specific URL schemes

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check your Supabase URL and anon key
   - Verify redirect URL configuration
   - Ensure proper deep linking setup

2. **Database Access Issues**
   - Check RLS policies
   - Verify JWT token is being properly sent
   - Check table permissions

3. **Real-time Not Working**
   - Ensure subscriptions are properly set up
   - Check that real-time is enabled in Supabase dashboard
   - Verify subscription cleanup on unmount

## Migration from Mock API

See `SUPABASE_MIGRATION.md` for the complete migration plan and progress.

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase React Native Guide](https://supabase.io/docs/guides/with-react-native)
- [Supabase Auth Documentation](https://supabase.io/docs/guides/auth)
- [Expo + Supabase Guide](https://docs.expo.dev/guides/using-supabase/)

## Contributing

When contributing to the Supabase implementation:

1. Follow the existing patterns for services and hooks
2. Update the SQL scripts if you modify the database schema
3. Test across all supported platforms (web, iOS, Android)
4. Document any platform-specific considerations
5. Update this README with new information as needed 