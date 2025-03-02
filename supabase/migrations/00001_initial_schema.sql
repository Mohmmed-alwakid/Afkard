-- Set up required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types for enums
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('researcher', 'participant');
CREATE TYPE IF NOT EXISTS project_status AS ENUM ('draft', 'active', 'archived', 'deleted');
CREATE TYPE IF NOT EXISTS study_type AS ENUM ('test', 'interview');
CREATE TYPE IF NOT EXISTS study_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE IF NOT EXISTS participant_status AS ENUM ('pending', 'accepted', 'completed', 'rejected');
CREATE TYPE IF NOT EXISTS reward_status AS ENUM ('pending', 'paid', 'cancelled');

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  organization TEXT,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_sign_in TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{"theme": "light", "language": "en", "notifications": {"email": true, "push": true, "desktop": true}, "timezone": "UTC", "currency": "USD"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_ids UUID[] NOT NULL DEFAULT '{}',
  status project_status NOT NULL DEFAULT 'draft',
  settings JSONB NOT NULL DEFAULT '{"privacy": "private", "allow_comments": true, "require_approval": false}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create studies table
CREATE TABLE IF NOT EXISTS studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type study_type NOT NULL DEFAULT 'test',
  status study_status NOT NULL DEFAULT 'draft',
  target_audience JSONB NOT NULL DEFAULT '{"age_range": [18, 65], "gender": ["male", "female", "other"], "location": [], "languages": [], "criteria": {}}',
  settings JSONB NOT NULL DEFAULT '{"max_participants": 10, "reward_amount": 0, "estimated_duration": 30, "auto_approve": false}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_participants table
CREATE TABLE IF NOT EXISTS study_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  feedback JSONB,
  reward_status reward_status NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(study_id, user_id)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  path TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a trigger to set updated_at on update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to set updated_at on all tables that have it
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_studies_updated_at
BEFORE UPDATE ON studies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_study_participants_updated_at
BEFORE UPDATE ON study_participants
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_files_updated_at
BEFORE UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Create a trigger to create user profile after user creation
CREATE OR REPLACE FUNCTION create_profile_after_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_after_user_creation
AFTER INSERT ON users
FOR EACH ROW EXECUTE FUNCTION create_profile_after_user_creation();

-- Create a trigger to handle auth.users creation and sync to users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_value user_role;
BEGIN
  -- Extract role from user metadata or default to 'participant'
  role_value := COALESCE(
    (NEW.raw_user_meta_data->>'role')::user_role, 
    'participant'::user_role
  );

  -- Insert into custom users table
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
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    role_value,
    NEW.raw_user_meta_data->>'organization',
    NEW.email_confirmed
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up trigger to sync auth users to custom users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update email_verified when auth.users is updated
CREATE OR REPLACE FUNCTION public.sync_user_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email_verified = NEW.email_confirmed
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email_confirmed ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_email_verified();

-- Set up row level security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY users_policy_select ON users
  FOR SELECT USING (auth.uid() = id);

-- Profiles can be viewed by the owner
CREATE POLICY profiles_policy_select ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Projects can be viewed by owner and team members
CREATE POLICY projects_policy_select ON projects
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() = ANY(team_ids)
  );

-- Studies can be viewed by project members and participants
CREATE POLICY studies_policy_select ON studies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = studies.project_id AND
      (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_ids))
    ) OR
    EXISTS (
      SELECT 1 FROM study_participants
      WHERE study_participants.study_id = studies.id AND
      study_participants.user_id = auth.uid()
    )
  );

-- Basic policies for the rest (can be expanded as needed)
CREATE POLICY study_participants_policy_select ON study_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM studies
      JOIN projects ON studies.project_id = projects.id
      WHERE studies.id = study_participants.study_id AND
      (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_ids))
    )
  );

CREATE POLICY files_policy_select ON files
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = files.project_id AND
      (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_ids))
    )
  );

-- Allow authenticated users to log analytics
CREATE POLICY analytics_policy_insert ON analytics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant basic read permissions to anonymous users (for public content)
GRANT SELECT ON TABLE projects TO anon;
GRANT SELECT ON TABLE studies TO anon;

-- Apply Foreign Key Constraints
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE projects
  ADD CONSTRAINT fk_projects_owner
  FOREIGN KEY (owner_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE studies
  ADD CONSTRAINT fk_studies_project
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE CASCADE;

ALTER TABLE study_participants
  ADD CONSTRAINT fk_study_participants_study
  FOREIGN KEY (study_id)
  REFERENCES studies(id)
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_study_participants_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;

ALTER TABLE files
  ADD CONSTRAINT fk_files_owner
  FOREIGN KEY (owner_id)
  REFERENCES users(id)
  ON DELETE CASCADE,
  ADD CONSTRAINT fk_files_project
  FOREIGN KEY (project_id)
  REFERENCES projects(id)
  ON DELETE SET NULL,
  ADD CONSTRAINT fk_files_study
  FOREIGN KEY (study_id)
  REFERENCES studies(id)
  ON DELETE SET NULL;

ALTER TABLE analytics
  ADD CONSTRAINT fk_analytics_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE SET NULL; 