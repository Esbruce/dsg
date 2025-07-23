-- Create rate_limits table for persistent rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL,
    type TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_client_type ON public.rate_limits(client_id, type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_time ON public.rate_limits(reset_time);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON public.rate_limits(created_at);

-- Create unique constraint to prevent duplicate entries for same client and type
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_unique_client_type ON public.rate_limits(client_id, type);

-- Add RLS policies for security
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access rate_limits table
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON public.rate_limits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.rate_limits IS 'Rate limiting data for API endpoints';
COMMENT ON COLUMN public.rate_limits.client_id IS 'Unique identifier for client (IP or phone number)';
COMMENT ON COLUMN public.rate_limits.type IS 'Type of rate limit (otp_send, otp_resend, otp_verify, etc.)';
COMMENT ON COLUMN public.rate_limits.count IS 'Number of requests made in current window';
COMMENT ON COLUMN public.rate_limits.reset_time IS 'When the rate limit window resets'; 