-- Simplified Referral System using User UUIDs
-- This replaces the complex referral_codes table with direct UUID usage

-- Drop the old referral_codes table and related functions
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code();
DROP FUNCTION IF EXISTS generate_referral_code_uuid();

-- Keep the referrals and referral_rewards tables as they are
-- (These are still needed for tracking referral relationships and rewards)

-- Add a constraint to ensure referred_by is a valid UUID
ALTER TABLE users 
ADD CONSTRAINT check_referred_by_uuid 
CHECK (referred_by IS NULL OR referred_by ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Add a constraint to prevent self-referrals
ALTER TABLE users 
ADD CONSTRAINT check_no_self_referral 
CHECK (referred_by IS NULL OR referred_by != id);

-- Create a function to get referral link for a user
CREATE OR REPLACE FUNCTION public.get_user_referral_link(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.base_url', true) || '/?ref=' || user_uuid::text;
END;
$$ LANGUAGE plpgsql;

-- Ensure a fixed, safe search_path
ALTER FUNCTION public.get_user_referral_link(UUID) SET search_path = pg_catalog, public;

-- Create a function to validate referral UUID
CREATE OR REPLACE FUNCTION public.validate_referral_uuid(referral_uuid TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the UUID format is valid
  IF referral_uuid !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = referral_uuid::UUID) INTO user_exists;
  
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql;

-- Ensure a fixed, safe search_path
ALTER FUNCTION public.validate_referral_uuid(TEXT) SET search_path = pg_catalog, public;

-- Create a function to process referral when user becomes paid
CREATE OR REPLACE FUNCTION public.process_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if user just became paid and has a referrer
  IF NEW.is_paid = TRUE AND OLD.is_paid = FALSE AND NEW.referred_by IS NOT NULL THEN
    -- Insert referral record if it doesn't exist
    INSERT INTO referrals (referrer_id, referee_id, status)
    VALUES (NEW.referred_by, NEW.id, 'converted')
    ON CONFLICT (referrer_id, referee_id) DO UPDATE SET
      status = 'converted',
      converted_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure a fixed, safe search_path
ALTER FUNCTION public.process_referral_reward() SET search_path = pg_catalog, public;

-- Create trigger to automatically process referral rewards
DROP TRIGGER IF EXISTS trigger_process_referral_reward ON users;
CREATE TRIGGER trigger_process_referral_reward
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_referral_reward();

-- Update RLS policies for the simplified system
-- Users can view their own referral data
CREATE POLICY "Users can view their own referral data" ON referrals
  FOR SELECT USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referee_id);

-- Users can insert referrals (when they sign up with a referral)
CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK ((select auth.uid()) = referee_id);

-- Users can update their own referrals
CREATE POLICY "Users can update their own referrals" ON referrals
  FOR UPDATE USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referee_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_referral_link(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_referral_uuid(TEXT) TO authenticated;