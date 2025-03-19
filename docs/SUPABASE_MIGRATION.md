# Supabase Migration Plan

This document outlines the phased approach to migrating the Pickleball App from a mock API to a Supabase backend.

## Overview

The migration involves transitioning several key areas of the application:
- Authentication
- User Profile Management
- Game Data
- Bookings & Reservations
- Payment Integration
- Real-time Features

## Migration Phases

### Phase 1: Setup and Configuration ✅

- [x] Create a Supabase project
- [x] Configure authentication settings (email, social providers)
- [x] Set up database tables based on current app schema
- [x] Create and configure storage buckets
- [x] Establish project environment variables
- [x] Configure security policies
- [x] Set up real-time subscriptions

### Phase 2: Authentication Migration ✅

- [x] Implement Supabase client initialization
- [x] Create authentication service with Supabase
  - [x] User signup
  - [x] User login
  - [x] Social authentication
  - [x] Password reset
  - [x] Session management
- [x] Create custom hook to manage auth state and actions
- [x] Update AuthContext to use Supabase
- [x] Handle multi-platform authentication logic (web/mobile differences)
- [x] Test authentication flows across platforms

### Phase 3: Profile Management Migration ✅

- [x] Implement profile service with Supabase
  - [x] Profile retrieval
  - [x] Profile updates
  - [x] First-time profile setup
- [x] Implement profile image upload to Supabase storage
- [x] Update profile-related components to use Supabase
- [x] Create real-time subscriptions for profile changes
- [x] Ensure proper error handling and validation

### Phase 4: Game Data Migration 🔄

- [ ] Create game data schema in Supabase
- [ ] Implement game data service
  - [ ] Game listing
  - [ ] Game details
  - [ ] Game filtering
  - [ ] Game availability
- [ ] Update game-related components to use Supabase
- [ ] Implement caching strategies for game data
- [ ] Test game data retrieval and display

### Phase 5: Bookings & Reservations 🔄

- [ ] Create bookings schema in Supabase
- [ ] Implement booking service
  - [ ] Create bookings
  - [ ] Cancel bookings
  - [ ] Retrieve user bookings
  - [ ] Update booking status
- [ ] Implement availability checking logic
- [ ] Update booking-related components to use Supabase
- [ ] Create real-time subscriptions for booking changes
- [ ] Implement booking notifications

### Phase 6: Payment Integration 🔜

- [ ] Research Supabase integration with payment providers
- [ ] Implement payment methods storage in Supabase
- [ ] Create secure payment processing flow
- [ ] Handle subscription management
- [ ] Implement billing history and receipts
- [ ] Test payment flows end-to-end

### Phase 7: Real-time Features 🔜

- [ ] Implement real-time game updates
- [ ] Create real-time chat functionality
- [ ] Implement real-time notifications
- [ ] Ensure proper subscription cleanup on component unmount
- [ ] Test real-time features under various conditions

### Phase 8: Testing and Optimization 🔜

- [ ] Create comprehensive tests for Supabase integration
- [ ] Optimize data fetching and caching
- [ ] Implement proper error handling and fallbacks
- [ ] Performance testing with real data volumes
- [ ] Security review of Supabase implementation

### Phase 9: Final Cleanup 🔜

- [ ] Remove all mockApi references
- [ ] Clean up unused code and deprecated functions
- [ ] Update documentation to reflect Supabase backend
- [ ] Finalize environment configuration for production

## Implementation Notes

### Authentication

The authentication implementation uses Supabase's built-in auth system with JWT tokens. We've implemented platform-specific handling for:
- Mobile deep linking for email confirmation and password reset
- Web-based OAuth redirects
- Session persistence across app restarts

### Database Schema

Our Supabase database schema includes:
- `profiles` - Extends the auth.users schema with application-specific user data
- `games` - Game listings and availability
- `bookings` - User game bookings and status
- `payments` - Payment history and methods

### Security Considerations

- Row-level security (RLS) policies have been implemented to ensure users can only access their own data
- Storage bucket policies restrict access to authorized users
- Environment variables are properly secured and not exposed to clients
- Authentication tokens are securely stored and managed

### Real-time Implementation

Supabase's real-time subscriptions are used for:
- Profile updates
- Game availability changes
- Booking status updates
- Chat messages
- Notifications

## Progress Status

- ✅ Complete
- 🔄 In Progress
- 🔜 Upcoming

## Troubleshooting Common Issues

### Authentication Issues

- **Problem**: "ReferenceError: window is not defined"
  **Solution**: Ensure that window references are only used in the web platform via Platform.OS checks.

- **Problem**: OAuth redirects not working on web
  **Solution**: Double-check the redirect URL configuration in the Supabase dashboard and ensure it matches your app's URL.

### Database Issues

- **Problem**: Permission denied for table operations
  **Solution**: Review and update RLS policies to ensure proper access.

### Real-time Issues

- **Problem**: Subscriptions not receiving updates
  **Solution**: Verify the channel name and ensure proper subscription cleanup.

## Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase with React Native](https://supabase.io/docs/guides/with-react-native)
- [Supabase Authentication](https://supabase.io/docs/guides/auth)
- [Supabase Storage](https://supabase.io/docs/guides/storage)
- [Supabase Real-time](https://supabase.io/docs/guides/realtime) 