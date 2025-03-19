#!/usr/bin/env node

/**
 * Supabase Database Seeder
 * 
 * This script populates the Supabase database with sample data for development and testing.
 * Run with: node scripts/supabase/seed.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Open'];
const GAME_STATUSES = ['Upcoming', 'InProgress', 'Completed', 'Cancelled'];

// Sample data
const SAMPLE_LOCATIONS = [
  {
    name: 'Downtown Community Center',
    address: '123 Main Street',
    city: 'Pickleville',
    state: 'CA',
    zip_code: '90210',
    country: 'USA',
    latitude: 34.0522,
    longitude: -118.2437,
    image_url: 'https://images.unsplash.com/photo-1630999938981-3ed5737a909e',
    description: 'Modern indoor courts with professional flooring',
    amenities: ['Parking', 'Restrooms', 'Water Fountains', 'Locker Rooms']
  },
  {
    name: 'Sunrise Park Courts',
    address: '456 Oak Avenue',
    city: 'Racquetville',
    state: 'NY',
    zip_code: '10001',
    country: 'USA',
    latitude: 40.7128,
    longitude: -74.0060,
    image_url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65',
    description: 'Outdoor courts with beautiful morning lighting',
    amenities: ['Parking', 'Restrooms', 'Picnic Area', 'Shade Structures']
  },
  {
    name: 'Westside Athletic Club',
    address: '789 Palm Drive',
    city: 'Sportstown',
    state: 'FL',
    zip_code: '33101',
    country: 'USA',
    latitude: 25.7617,
    longitude: -80.1918,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97',
    description: 'Premium club with both indoor and outdoor courts',
    amenities: ['Parking', 'Restrooms', 'Pro Shop', 'Cafe', 'Locker Rooms', 'Showers']
  }
];

const SAMPLE_MEMBERSHIP_PLANS = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    benefits: ['Basic game access', 'Create player profile', 'Join public games'],
    description: 'Perfect for casual players who want to try out the app',
    is_active: true
  },
  {
    name: 'Drop-in Player',
    price: 1999,
    interval: 'month',
    benefits: ['Priority game registration', 'No booking fees', 'Game history tracking', 'Player stats'],
    description: 'Great for regular players who want extra features',
    is_active: true
  },
  {
    name: 'Premium Member',
    price: 9999,
    interval: 'year',
    benefits: ['VIP court access', 'Free guest passes', 'Pro coaching sessions', 'Tournament entry', 'Equipment discounts'],
    description: 'The ultimate package for dedicated players',
    is_active: true
  }
];

// Seed functions
async function seedLocations() {
  console.log('Seeding locations...');
  
  for (const location of SAMPLE_LOCATIONS) {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select();
    
    if (error) {
      console.error('Error seeding location:', error);
    } else {
      console.log(`Created location: ${location.name}`);
    }
  }
}

async function seedMembershipPlans() {
  console.log('Seeding membership plans...');
  
  for (const plan of SAMPLE_MEMBERSHIP_PLANS) {
    const { data, error } = await supabase
      .from('membership_plans')
      .insert(plan)
      .select();
    
    if (error) {
      console.error('Error seeding membership plan:', error);
    } else {
      console.log(`Created membership plan: ${plan.name}`);
    }
  }
}

async function createTestUsers() {
  console.log('Creating test users...');
  
  const testUsers = [
    { email: 'player1@example.com', password: 'Password123!', name: 'Alex Johnson' },
    { email: 'player2@example.com', password: 'Password123!', name: 'Jordan Smith' },
    { email: 'player3@example.com', password: 'Password123!', name: 'Taylor Brown' }
  ];
  
  for (const user of testUsers) {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name
        }
      }
    });
    
    if (authError) {
      console.error(`Error creating auth user ${user.email}:`, authError);
      continue;
    }
    
    const userId = authData.user.id;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email,
        name: user.name,
        skill_level: SKILL_LEVELS[Math.floor(Math.random() * SKILL_LEVELS.length)],
        has_completed_profile: true,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        privacy_policy_accepted: true,
        privacy_policy_accepted_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error(`Error creating profile for ${user.email}:`, profileError);
    } else {
      console.log(`Created test user: ${user.email}`);
    }
    
    // Create user preferences
    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        notifications_enabled: true,
        email_updates_enabled: true,
        match_alerts_enabled: true
      });
    
    if (prefsError) {
      console.error(`Error creating preferences for ${user.email}:`, prefsError);
    }
  }
}

async function seedSampleGames() {
  console.log('Seeding sample games...');
  
  // Get host users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, name')
    .limit(3);
  
  if (usersError || !users?.length) {
    console.error('Error getting users for games:', usersError);
    return;
  }
  
  // Get locations
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, name')
    .limit(3);
  
  if (locationsError || !locations?.length) {
    console.error('Error getting locations for games:', locationsError);
    return;
  }
  
  // Create sample games
  const now = new Date();
  const gameData = [];
  
  // Create games for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    
    // Morning game
    const morningStart = new Date(date);
    morningStart.setHours(9, 0, 0, 0);
    
    const morningEnd = new Date(morningStart);
    morningEnd.setHours(morningStart.getHours() + 2);
    
    // Afternoon game
    const afternoonStart = new Date(date);
    afternoonStart.setHours(14, 0, 0, 0);
    
    const afternoonEnd = new Date(afternoonStart);
    afternoonEnd.setHours(afternoonStart.getHours() + 2);
    
    // Evening game
    const eveningStart = new Date(date);
    eveningStart.setHours(18, 0, 0, 0);
    
    const eveningEnd = new Date(eveningStart);
    eveningEnd.setHours(eveningStart.getHours() + 2);
    
    // Create the three games for this day
    gameData.push(
      {
        title: `Morning Pickleball Session`,
        description: `Start your day with a fun pickleball game! All skill levels welcome.`,
        start_time: morningStart.toISOString(),
        end_time: morningEnd.toISOString(),
        location_id: locations[i % locations.length].id,
        host_id: users[i % users.length].id,
        max_players: 8,
        skill_level: 'Beginner',
        price: 1500, // $15.00
        status: morningStart < now ? 'Completed' : 'Upcoming'
      },
      {
        title: `Afternoon Competitive Play`,
        description: `Join us for an intermediate level pickleball session in the afternoon.`,
        start_time: afternoonStart.toISOString(),
        end_time: afternoonEnd.toISOString(),
        location_id: locations[(i + 1) % locations.length].id,
        host_id: users[(i + 1) % users.length].id,
        max_players: 4,
        skill_level: 'Intermediate',
        price: 2000, // $20.00
        status: afternoonStart < now ? 'Completed' : 'Upcoming'
      },
      {
        title: `Evening Doubles Tournament`,
        description: `Evening doubles play with rotating partners. Prizes for winners!`,
        start_time: eveningStart.toISOString(),
        end_time: eveningEnd.toISOString(),
        location_id: locations[(i + 2) % locations.length].id,
        host_id: users[(i + 2) % users.length].id,
        max_players: 16,
        skill_level: 'Advanced',
        price: 2500, // $25.00
        status: eveningStart < now ? 'Completed' : 'Upcoming'
      }
    );
  }
  
  // Insert games in batches
  for (let i = 0; i < gameData.length; i += 5) {
    const batch = gameData.slice(i, i + 5);
    const { data, error } = await supabase
      .from('games')
      .insert(batch)
      .select();
    
    if (error) {
      console.error('Error seeding games:', error);
    } else {
      console.log(`Created ${batch.length} games`);
    }
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Seed in sequence to maintain referential integrity
    await seedLocations();
    await seedMembershipPlans();
    await createTestUsers();
    await seedSampleGames();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

// Run the seeder
seedDatabase(); 