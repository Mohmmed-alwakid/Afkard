-- Safe type creation - check if type exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('researcher', 'participant');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived', 'deleted');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_type') THEN
        CREATE TYPE study_type AS ENUM ('test', 'interview');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'study_status') THEN
        CREATE TYPE study_status AS ENUM ('draft', 'active', 'completed', 'archived');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_status') THEN
        CREATE TYPE participant_status AS ENUM ('pending', 'accepted', 'completed', 'rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_status') THEN
        CREATE TYPE reward_status AS ENUM ('pending', 'paid', 'cancelled');
    END IF;
END$$;

-- Fix the user trigger function for better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a better handle_new_user function with more robust error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_value user_role;
  first_name_value TEXT;
  last_name_value TEXT;
  organization_value TEXT;
BEGIN
  -- Log the new user being created
  RAISE NOTICE 'Handling new user creation: %', NEW.email;
  
  -- Safely extract role from user metadata and handle it being missing
  BEGIN
    role_value := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    -- Default to participant if missing or invalid
    role_value := 'participant';
    RAISE NOTICE 'Defaulting to participant role for: %', NEW.email;
  END;

  -- Extract other metadata safely
  first_name_value := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  last_name_value := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  organization_value := COALESCE(NEW.raw_user_meta_data->>'organization', '');

  -- Log the values we're about to insert
  RAISE NOTICE 'Inserting user with first_name: %, last_name: %, role: %', 
    first_name_value, last_name_value, role_value;

  -- Insert into custom users table with enhanced error handling
  BEGIN
    -- Check if user already exists in the users table
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
      INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        role,
        organization,
        email_verified
      ) VALUES (
        NEW.id,
        NEW.email,
        first_name_value,
        last_name_value,
        role_value,
        organization_value,
        NEW.email_confirmed
      );
      RAISE NOTICE 'User inserted successfully: %', NEW.email;
    ELSE
      RAISE NOTICE 'User already exists in users table: %', NEW.email;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error details but allow the auth user to be created
    -- This prevents auth.users and public.users from becoming out of sync
    RAISE NOTICE 'Error inserting into users table: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger with the improved function
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles are created for existing users that might be missing them
DO $$
DECLARE
  missing_users RECORD;
BEGIN
  FOR missing_users IN 
    SELECT u.id FROM public.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO public.profiles (user_id)
    VALUES (missing_users.id);
    
    RAISE NOTICE 'Created missing profile for user: %', missing_users.id;
  END LOOP;
END $$; 