-- Fix Function Search Path Mutable Security Issue
-- This script fixes the security warning for the update_updated_at_column function
-- by setting a secure search_path to prevent privilege escalation attacks

-- Note: We use CREATE OR REPLACE instead of DROP to avoid breaking triggers
-- that depend on this function

-- Create/Replace the function with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
