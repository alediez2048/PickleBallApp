require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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

async function setupPolicies() {
  console.log('Setting up storage policies...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-storage-policies.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Some policies already exist');
      } else {
        console.error('❌ Error setting up policies:', error.message);
        return;
      }
    }

    console.log('✅ Storage policies have been set up');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

function printSQLInstructions() {
  console.log('To set up storage policies:\n');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to the SQL Editor');
  console.log('3. Copy and paste the following SQL:\n');

  const sqlPath = path.join(__dirname, 'setup-storage-policies.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(sql);
  
  console.log('\n4. Execute the SQL in the editor');
  console.log('5. Verify the policies are created in the Storage section');
}

setupPolicies().catch(console.error);
printSQLInstructions(); 