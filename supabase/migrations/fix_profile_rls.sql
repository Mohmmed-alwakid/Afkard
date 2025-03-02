-- Fix Row-Level Security for Profiles Table
-- This migration addresses the "42501" error by adjusting RLS policies

-- First ensure the profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "preferences" JSONB DEFAULT '{}'::jsonb,
  UNIQUE("user_id")
);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them" ON "public"."profiles";
DROP POLICY IF EXISTS "Profiles are editable by users who created them" ON "public"."profiles";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."profiles";
DROP POLICY IF EXISTS "Service role can manage all profiles" ON "public"."profiles";

-- Enable RLS on profiles table
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to view their own profiles
CREATE POLICY "Profiles are viewable by users who created them"
ON "public"."profiles"
FOR SELECT
USING (auth.uid() = user_id);

-- Create a policy that allows users to update their own profiles
CREATE POLICY "Profiles are editable by users who created them"
ON "public"."profiles"
FOR UPDATE
USING (auth.uid() = user_id);

-- Create a policy that allows profile creation during signup
CREATE POLICY "Enable insert for profile creation"
ON "public"."profiles"
FOR INSERT
WITH CHECK (
  -- Allow insert if the user_id matches the authenticated user
  -- OR if the request is coming from a trusted service role
  auth.uid() = user_id OR
  auth.role() = 'service_role' OR
  -- Also allow during the initial user creation
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = user_id
    AND auth.users.created_at >= (now() - interval '5 seconds')
  )
);

-- Create a policy that allows the service role full access
CREATE POLICY "Service role has full access"
ON "public"."profiles"
USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON "public"."profiles" TO service_role;
GRANT SELECT, INSERT, UPDATE ON "public"."profiles" TO authenticated;

-- Only grant sequence permissions if the sequence exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name = 'profiles_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE ON SEQUENCE "public"."profiles_id_seq" TO authenticated';
  END IF;
END $$;

-- Create or update the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a row into public.profiles
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't prevent user creation
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix any existing users without profiles
DO $$
BEGIN
  INSERT INTO public.profiles (user_id)
  SELECT id FROM auth.users
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
  );
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error fixing existing users: %', SQLERRM;
END;
$$; 