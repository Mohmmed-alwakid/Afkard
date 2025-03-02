-- This migration script ensures all new users get proper profiles
-- and fixes any existing users that might be missing profiles

-- Drop existing triggers to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create a bulletproof handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  BEGIN
    -- Check if user already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
      -- Insert the user with basic required fields
      INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
      ) 
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(
          (CASE 
            WHEN NEW.raw_user_meta_data->>'role' = 'researcher' THEN 'researcher'::user_role
            ELSE 'participant'::user_role
          END),
          'participant'::user_role
        ),
        NOW(),
        NOW()
      );
      
      -- Now ensure a profile exists
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
        INSERT INTO public.profiles (user_id) VALUES (NEW.id);
      END IF;
    END IF;
  
  -- Catch any errors but allow auth user creation to proceed
  EXCEPTION WHEN OTHERS THEN
    -- Don't error out the trigger, just log
    RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing users that might not have profiles
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id FROM public.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO public.profiles (user_id) VALUES (user_record.id);
    RAISE NOTICE 'Created missing profile for user: %', user_record.id;
  END LOOP;
END $$; 