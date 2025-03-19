require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service role key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('Setting up Supabase storage buckets...\n');

  const buckets = [
    {
      id: 'profile-images',
      name: 'Profile Images',
      public: false,
      fileSizeLimit: 5242880, // 5MB
    },
    {
      id: 'game-images',
      name: 'Game Images',
      public: false,
      fileSizeLimit: 10485760, // 10MB
    },
    {
      id: 'location-images',
      name: 'Location Images',
      public: false,
      fileSizeLimit: 10485760, // 10MB
    }
  ];

  for (const bucket of buckets) {
    try {
      console.log(`Setting up bucket '${bucket.id}'...`);
      
      // Try to create bucket
      const { data, error } = await supabase
        .storage
        .createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Bucket '${bucket.id}' already exists`);
          
          // Update bucket configuration
          const { error: updateError } = await supabase
            .storage
            .updateBucket(bucket.id, {
              public: bucket.public,
              fileSizeLimit: bucket.fileSizeLimit,
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
            });

          if (updateError) {
            console.error(`❌ Failed to update bucket '${bucket.id}':`, updateError.message);
          } else {
            console.log(`✅ Updated bucket '${bucket.id}' configuration`);
          }
        } else {
          console.error(`❌ Failed to create bucket '${bucket.id}':`, error.message);
        }
      } else {
        console.log(`✅ Created bucket '${bucket.id}'`);
      }

      // Set up bucket policies
      console.log(`Setting up policies for bucket '${bucket.id}'...`);
      
      const policies = [
        {
          name: `Anyone can view ${bucket.id}`,
          operation: 'SELECT',
          condition: `bucket_id = '${bucket.id}'`
        },
        {
          name: `Users can upload their own ${bucket.id}`,
          operation: 'INSERT',
          condition: `bucket_id = '${bucket.id}' AND auth.uid() = (storage.foldername(name))[1]`
        },
        {
          name: `Users can update their own ${bucket.id}`,
          operation: 'UPDATE',
          condition: `bucket_id = '${bucket.id}' AND auth.uid() = (storage.foldername(name))[1]`
        },
        {
          name: `Users can delete their own ${bucket.id}`,
          operation: 'DELETE',
          condition: `bucket_id = '${bucket.id}' AND auth.uid() = (storage.foldername(name))[1]`
        }
      ];

      for (const policy of policies) {
        const { error: policyError } = await supabase
          .storage
          .createPolicy(bucket.id, policy);

        if (policyError) {
          if (policyError.message.includes('already exists')) {
            console.log(`ℹ️ Policy '${policy.name}' already exists`);
          } else {
            console.error(`❌ Failed to create policy '${policy.name}':`, policyError.message);
          }
        } else {
          console.log(`✅ Created policy '${policy.name}'`);
        }
      }
    } catch (err) {
      console.error(`❌ Error setting up bucket '${bucket.id}':`, err.message);
    }
  }
}

setupStorage().catch(console.error); 