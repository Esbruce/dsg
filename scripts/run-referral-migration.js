const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runReferralMigration() {
  console.log('🚀 Starting referral system migration...');

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Please ensure these are set in your environment or .env file');
    process.exit(1);
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../lib/database/migrations/create_referral_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executing referral system migration...');

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Referral system migration completed successfully!');
    console.log('');
    console.log('📋 What was created:');
    console.log('  - referral_codes table');
    console.log('  - referrals table');
    console.log('  - referral_rewards table');
    console.log('  - RLS policies for security');
    console.log('  - Indexes for performance');
    console.log('  - Database functions for code generation');
    console.log('');
    console.log('🎉 Your referral system is now ready to use!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runReferralMigration(); 