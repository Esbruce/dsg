-- Optional performance index for threshold-based referral discount checks
-- Speeds up queries counting paid referees per referrer

CREATE INDEX IF NOT EXISTS idx_users_referred_by
ON public.users(referred_by);


