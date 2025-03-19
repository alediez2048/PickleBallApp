require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase URL, anon key, or service key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function verifySetup() {
  console.log('Verifying Supabase setup...\n');

  // Check connection
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Connection test failed:', error.message);
      return;
    }
    console.log('✅ Successfully connected to Supabase');
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    return;
  }

  // Check tables
  const tables = [
    'profiles',
    'addresses',
    'locations',
    'games',
    'game_participants',
    'membership_plans',
    'user_memberships',
    'payment_methods',
    'payment_transactions',
    'user_preferences',
    'game_ratings',
    'user_game_history',
    'healthcheck'
  ];

  console.log('\nChecking database tables...');
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST204') {
        console.error(`❌ Table '${table}' not found`);
      } else if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      console.error(`❌ Error checking table '${table}':`, err.message);
    }
  }

  // Check storage buckets
  console.log('\nChecking storage buckets...');
  try {
    const { data: buckets, error } = await supabaseAdmin
      .storage
      .listBuckets();

    if (error) {
      console.error('❌ Error listing storage buckets:', error.message);
      return;
    }

    const requiredBuckets = ['profile-images', 'game-images', 'location-images'];
    const existingBuckets = new Set(buckets.map(b => b.name));

    for (const bucket of requiredBuckets) {
      if (existingBuckets.has(bucket)) {
        console.log(`✅ Bucket '${bucket}' exists`);
      } else {
        console.log(`❌ Bucket '${bucket}' not found`);
      }
    }
  } catch (err) {
    console.error('❌ Error checking storage buckets:', err.message);
  }
}

verifySetup().catch(console.error); 