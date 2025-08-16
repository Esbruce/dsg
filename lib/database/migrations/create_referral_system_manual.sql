-- Manual Migration for Referral System
-- Copy and paste this into your Supabase SQL Editor

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'converted', 'expired')) DEFAULT 'pending',
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- Create referral_rewards table to track rewards given
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT CHECK (reward_type IN ('credit', 'discount')) NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'gbp',
  stripe_invoice_item_id TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);

-- Add covering index for users.referred_by to match production
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Add RLS policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral codes" ON referral_codes
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own referral codes" ON referral_codes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- RLS policies for referrals
CREATE POLICY "Users can view referrals they made" ON referrals
  FOR SELECT USING ((select auth.uid()) = referrer_id);

CREATE POLICY "Users can view referrals where they were referred" ON referrals
  FOR SELECT USING ((select auth.uid()) = referee_id);

CREATE POLICY "Users can insert referrals" ON referrals
  FOR INSERT WITH CHECK ((select auth.uid()) = referee_id);

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own rewards" ON referral_rewards
  FOR SELECT USING ((select auth.uid()) = referrer_id);

-- Function to generate referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE referral_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Ensure a fixed, safe search_path for reliability and security
ALTER FUNCTION public.generate_referral_code() SET search_path = pg_catalog, public;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure a fixed, safe search_path for reliability and security
ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_referral_codes_updated_at
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON referral_codes TO authenticated;
GRANT ALL ON referrals TO authenticated;
GRANT ALL ON referral_rewards TO authenticated; 