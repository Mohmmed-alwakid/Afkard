-- Migration to add login tracking
-- Adds a login_count column to the users table
-- Creates a function to update the login_count on login

-- Add login_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'login_count'
  ) THEN
    ALTER TABLE public.users ADD COLUMN login_count INTEGER DEFAULT 0 NOT NULL;
    
    -- Update existing users to have at least 1 login
    UPDATE public.users SET login_count = 1 WHERE login_count = 0;
  END IF;
END $$;

-- Add last_login_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_login_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create or replace the function to track logins
CREATE OR REPLACE FUNCTION public.handle_auth_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the login count for the user
  UPDATE public.users 
  SET 
    login_count = COALESCE(login_count, 0) + 1,
    last_login_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the sign in if the update fails
  RAISE LOG 'Error updating login stats: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_auth_sign_in ON auth.sessions;

-- Create the trigger to track sign ins
CREATE TRIGGER on_auth_sign_in
AFTER INSERT ON auth.sessions
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_sign_in();

-- Also add last active tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN last_active_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create a function to update last_active_at on session refresh
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update once per hour to avoid excessive updates
  UPDATE public.users 
  SET last_active_at = NOW()
  WHERE 
    id = NEW.user_id 
    AND (
      last_active_at IS NULL 
      OR last_active_at < NOW() - INTERVAL '1 hour'
    );
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the session refresh if the update fails
  RAISE LOG 'Error updating user activity: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS on_session_refresh ON auth.refresh_tokens;

-- Create the trigger to update activity
CREATE TRIGGER on_session_refresh
AFTER INSERT ON auth.refresh_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_user_activity(); 