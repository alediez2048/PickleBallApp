/**
 * This file defines the database schema for our Supabase tables.
 * It provides TypeScript types for each table and relationships between them.
 */

/**
 * Database Profiles (extends Auth Users)
 * Stores user profile information
 */
export interface DBProfile {
  id: string;                       // UUID from auth.users
  updated_at: string;               // Timestamp
  email: string;                    // Email from auth.users
  name: string;                     // User's full name
  display_name?: string;            // User's display name
  skill_level?: string;             // Beginner, Intermediate, Advanced, etc.
  phone_number?: string;            // Phone number
  date_of_birth?: string;           // ISO date format
  profile_image_url?: string;       // Storage URL to profile image
  has_completed_profile: boolean;   // Whether the user completed profile setup
  waiver_accepted?: boolean;        // Whether the user accepted the waiver
  waiver_signed_at?: string;        // When the user signed the waiver
  terms_accepted?: boolean;         // Whether user accepted terms
  terms_accepted_at?: string;       // When user accepted terms
  privacy_policy_accepted?: boolean;// Whether user accepted privacy policy
  privacy_policy_accepted_at?: string; // When user accepted privacy policy
  created_at: string;               // Timestamp
}

/**
 * User Addresses
 * Stores user address information
 */
export interface DBAddress {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  street_address: string;           // Street address
  city: string;                     // City
  state: string;                    // State/Province
  zip_code: string;                 // ZIP/Postal code
  country: string;                  // Country
  is_default: boolean;              // Whether this is the default address
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Locations
 * Stores information about pickleball courts
 */
export interface DBLocation {
  id: string;                       // UUID
  name: string;                     // Location name
  address: string;                  // Street address
  city: string;                     // City
  state: string;                    // State/Province
  zip_code: string;                 // ZIP/Postal code
  country: string;                  // Country
  latitude: number;                 // Latitude coordinate
  longitude: number;                // Longitude coordinate
  image_url?: string;               // Image URL
  description?: string;             // Description
  amenities?: string[];             // Array of amenities
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Games
 * Stores information about pickleball game sessions
 */
export interface DBGame {
  id: string;                       // UUID
  title: string;                    // Game title
  description?: string;             // Game description
  start_time: string;               // Start time (ISO format)
  end_time: string;                 // End time (ISO format)
  location_id: string;              // References locations.id
  host_id: string;                  // References profiles.id (game creator)
  max_players: number;              // Maximum number of players
  skill_level: string;              // Required skill level
  price: number;                    // Price in cents
  image_url?: string;               // Game image URL
  status: string;                   // Upcoming, InProgress, Completed, Cancelled
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Game Participants
 * Joins users with games they're participating in
 */
export interface DBGameParticipant {
  id: string;                       // UUID
  game_id: string;                  // References games.id
  user_id: string;                  // References profiles.id
  status: string;                   // Registered, Cancelled, Attended, NoShow
  payment_status: string;           // Pending, Completed, Refunded
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Membership Plans
 * Defines the available membership plans
 */
export interface DBMembershipPlan {
  id: string;                       // UUID
  name: string;                     // Plan name
  price: number;                    // Price in cents
  interval: string;                 // month, year
  benefits: string[];               // Array of benefits
  description: string;              // Plan description
  is_active: boolean;               // Whether plan is currently offered
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * User Memberships
 * Tracks users' membership status
 */
export interface DBUserMembership {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  plan_id: string;                  // References membership_plans.id
  status: string;                   // Active, Cancelled, Expired
  start_date: string;               // ISO date format
  end_date?: string;                // ISO date format (if applicable)
  auto_renew: boolean;              // Whether it should auto-renew
  payment_method_id?: string;       // References payment_methods.id
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Payment Methods
 * Stores users' payment method information
 */
export interface DBPaymentMethod {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  provider_payment_id: string;      // ID from payment provider
  card_last4: string;               // Last 4 digits of card
  card_brand: string;               // Card brand (Visa, MC, etc.)
  expiry_month: string;             // Expiry month (MM)
  expiry_year: string;              // Expiry year (YYYY)
  is_default: boolean;              // Whether this is the default payment method
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Payment Transactions
 * Records all payment transactions
 */
export interface DBPaymentTransaction {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  payment_method_id: string;        // References payment_methods.id
  amount: number;                   // Amount in cents
  currency: string;                 // Currency code (USD, etc.)
  status: string;                   // Succeeded, Failed, Refunded
  type: string;                     // Game, Membership, etc.
  reference_id?: string;            // Game ID, Membership ID, etc.
  provider_transaction_id: string;  // Transaction ID from payment provider
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * User Preferences
 * Stores user preferences for the app
 */
export interface DBUserPreference {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  notifications_enabled: boolean;   // Push notifications
  email_updates_enabled: boolean;   // Marketing emails
  match_alerts_enabled: boolean;    // Game match alerts
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * Game Ratings
 * Allows users to rate games they've participated in
 */
export interface DBGameRating {
  id: string;                       // UUID
  game_id: string;                  // References games.id
  user_id: string;                  // References profiles.id
  rating: number;                   // 1-5 rating
  comment?: string;                 // Optional comment
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

/**
 * User Game History
 * Records games a user has played in the past
 */
export interface DBUserGameHistory {
  id: string;                       // UUID
  user_id: string;                  // References profiles.id
  game_id: string;                  // References games.id
  result: string;                   // Win, Loss, Draw
  score?: string;                   // Game score
  opponent_id?: string;             // References profiles.id
  created_at: string;               // Timestamp
  updated_at: string;               // Timestamp
}

// Export database schema interface
export interface Database {
  profiles: DBProfile;
  addresses: DBAddress;
  locations: DBLocation;
  games: DBGame;
  game_participants: DBGameParticipant;
  membership_plans: DBMembershipPlan;
  user_memberships: DBUserMembership;
  payment_methods: DBPaymentMethod;
  payment_transactions: DBPaymentTransaction;
  user_preferences: DBUserPreference;
  game_ratings: DBGameRating;
  user_game_history: DBUserGameHistory;
} 