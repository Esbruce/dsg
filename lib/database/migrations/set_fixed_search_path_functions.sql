-- Ensure functions use a fixed, safe search_path to satisfy security advisors
-- and avoid ambiguity during restores.

-- Harden public.update_updated_at_column() if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'update_updated_at_column'
      AND p.pronargs = 0
  ) THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public';
  END IF;
END $$;

-- Harden public.generate_referral_code() if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'generate_referral_code'
      AND p.pronargs = 0
  ) THEN
    EXECUTE 'ALTER FUNCTION public.generate_referral_code() SET search_path = pg_catalog, public';
  END IF;
END $$;




