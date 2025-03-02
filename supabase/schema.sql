-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT NOT NULL
);

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ 
DECLARE
  migration_exists BOOLEAN;
BEGIN
  -- Check if migration has been applied
  SELECT EXISTS (
    SELECT 1 FROM schema_versions WHERE version = 1
  ) INTO migration_exists;

  IF migration_exists THEN
    RAISE NOTICE 'Migration version 1 already applied';
    RETURN;
  END IF;

  -- Create ENUMs
  BEGIN
    CREATE TYPE user_role AS ENUM ('researcher', 'participant');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type user_role already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type theme_preference already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE language_preference AS ENUM ('en', 'ar');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type language_preference already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE study_type AS ENUM ('test', 'interview');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type study_type already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE study_status AS ENUM ('draft', 'active', 'completed', 'archived');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type study_status already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE project_status AS ENUM ('draft', 'active', 'archived', 'deleted');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type project_status already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE participant_status AS ENUM ('pending', 'accepted', 'completed', 'rejected');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type participant_status already exists, skipping...';
  END;

  BEGIN
    CREATE TYPE reward_status AS ENUM ('pending', 'paid', 'cancelled');
  EXCEPTION 
    WHEN duplicate_object THEN 
      RAISE NOTICE 'Type reward_status already exists, skipping...';
  END;

  -- Record migration start
  INSERT INTO schema_versions (version, description)
  VALUES (1, 'Initial schema setup with error handling and constraints');

  RAISE NOTICE 'Starting migration version 1...';
END $$;

-- Create tables and their dependencies
DO $$
BEGIN
  -- Create users table
  CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name TEXT NOT NULL CHECK (length(first_name) BETWEEN 2 AND 50),
    last_name TEXT NOT NULL CHECK (length(last_name) BETWEEN 2 AND 50),
    role user_role NOT NULL,
    organization TEXT CHECK (length(organization) BETWEEN 2 AND 100),
    title TEXT CHECK (length(title) BETWEEN 2 AND 100),
    bio TEXT CHECK (length(bio) BETWEEN 10 AND 500),
    avatar_url TEXT,
    phone TEXT CHECK (phone ~* '^\+?[0-9\s-()]{8,}$'),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    last_sign_in TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT users_name_check CHECK (
      first_name ~ '^[a-zA-Z\s]*$' AND
      last_name ~ '^[a-zA-Z\s]*$'
    )
  );
  RAISE NOTICE 'Created users table';

  -- Rest of the tables and functions follow the same pattern...
  -- Add error handling for duplicate email
  CREATE OR REPLACE FUNCTION handle_duplicate_email()
  RETURNS TRIGGER AS $$
  BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = NEW.email AND id != NEW.id) THEN
      RAISE EXCEPTION 'Email % already exists', NEW.email
        USING HINT = 'Please use a different email address',
              ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS check_duplicate_email ON users;
  CREATE TRIGGER check_duplicate_email
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_duplicate_email();

  -- Create profiles table with safe defaults
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{
      "theme": "system",
      "language": "en",
      "notifications": {
        "email": true,
        "push": true,
        "desktop": true
      },
      "timezone": "UTC",
      "currency": "USD"
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT profiles_preferences_check CHECK (
      jsonb_typeof(preferences->'theme') = 'string' AND
      jsonb_typeof(preferences->'language') = 'string' AND
      jsonb_typeof(preferences->'notifications') = 'object' AND
      jsonb_typeof(preferences->'timezone') = 'string' AND
      jsonb_typeof(preferences->'currency') = 'string'
    )
  );

  -- Create projects table with team validation
  CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
    description TEXT CHECK (length(description) BETWEEN 10 AND 1000),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_ids UUID[] NOT NULL DEFAULT '{}',
    status project_status NOT NULL DEFAULT 'draft',
    settings JSONB NOT NULL DEFAULT '{
      "privacy": "private",
      "allow_comments": true,
      "require_approval": false
    }'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT projects_team_ids_check CHECK (
      array_length(team_ids, 1) <= 100
    ),
    CONSTRAINT projects_settings_check CHECK (
      jsonb_typeof(settings->'privacy') = 'string' AND
      jsonb_typeof(settings->'allow_comments') = 'boolean' AND
      jsonb_typeof(settings->'require_approval') = 'boolean'
    )
  );

  -- Add team members validation
  CREATE OR REPLACE FUNCTION validate_team_members()
  RETURNS TRIGGER AS $$
  DECLARE
    invalid_user UUID;
  BEGIN
    -- Check if all team members exist in users table
    SELECT id INTO invalid_user
    FROM unnest(NEW.team_ids) AS team_id
    LEFT JOIN users ON users.id = team_id
    WHERE users.id IS NULL
    LIMIT 1;

    IF invalid_user IS NOT NULL THEN
      RAISE EXCEPTION 'Invalid team member: %', invalid_user
        USING HINT = 'All team members must be valid users',
              ERRCODE = 'foreign_key_violation';
    END IF;

    -- Check for duplicates
    IF (SELECT COUNT(*) FROM unnest(NEW.team_ids)) != array_length(NEW.team_ids, 1) THEN
      RAISE EXCEPTION 'Duplicate team members are not allowed'
        USING HINT = 'Remove duplicate team members',
              ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  DROP TRIGGER IF EXISTS check_team_members ON projects;
  CREATE TRIGGER check_team_members
    BEFORE INSERT OR UPDATE OF team_ids ON projects
    FOR EACH ROW
    EXECUTE FUNCTION validate_team_members();

  -- Create studies table with validation
  CREATE TABLE IF NOT EXISTS studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) BETWEEN 2 AND 200),
    description TEXT CHECK (length(description) BETWEEN 10 AND 2000),
    type study_type NOT NULL,
    status study_status NOT NULL DEFAULT 'draft',
    target_audience JSONB NOT NULL DEFAULT '{
      "age_range": [18, 65],
      "gender": ["male", "female"],
      "location": [],
      "languages": ["en"],
      "criteria": {}
    }'::jsonb,
    settings JSONB NOT NULL DEFAULT '{
      "max_participants": 100,
      "reward_amount": 0,
      "estimated_duration": 30,
      "auto_approve": false
    }'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT studies_target_audience_check CHECK (
      jsonb_typeof(target_audience->'age_range') = 'array' AND
      jsonb_typeof(target_audience->'gender') = 'array' AND
      jsonb_typeof(target_audience->'location') = 'array' AND
      jsonb_typeof(target_audience->'languages') = 'array' AND
      jsonb_typeof(target_audience->'criteria') = 'object'
    ),
    CONSTRAINT studies_settings_check CHECK (
      jsonb_typeof(settings->'max_participants') = 'number' AND
      jsonb_typeof(settings->'reward_amount') = 'number' AND
      jsonb_typeof(settings->'estimated_duration') = 'number' AND
      jsonb_typeof(settings->'auto_approve') = 'boolean'
    )
  );

  -- Add study participant limit validation
  CREATE OR REPLACE FUNCTION check_study_participant_limit()
  RETURNS TRIGGER AS $$
  DECLARE
    participant_count INTEGER;
    max_participants INTEGER;
  BEGIN
    -- Get current participant count and max limit
    SELECT COUNT(*), (s.settings->>'max_participants')::integer
    INTO participant_count, max_participants
    FROM studies s
    LEFT JOIN study_participants sp ON sp.study_id = s.id
    WHERE s.id = NEW.study_id
    GROUP BY s.id, s.settings;

    IF participant_count >= max_participants THEN
      RAISE EXCEPTION 'Study has reached maximum participant limit'
        USING HINT = 'Cannot add more participants to this study',
              ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create study_participants table with constraints
  CREATE TABLE IF NOT EXISTS study_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status participant_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    feedback JSONB CHECK (
      feedback IS NULL OR (
        jsonb_typeof(feedback->'rating') = 'number' AND
        jsonb_typeof(feedback->'comments') = 'string' AND
        jsonb_typeof(feedback->'technical_issues') = 'array'
      )
    ),
    reward_status reward_status NOT NULL DEFAULT 'pending',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT study_participants_unique UNIQUE (study_id, user_id),
    CONSTRAINT study_participants_completion_check CHECK (
      (status = 'completed' AND completed_at IS NOT NULL) OR
      (status != 'completed')
    )
  );

  DROP TRIGGER IF EXISTS check_participant_limit ON study_participants;
  CREATE TRIGGER check_participant_limit
    BEFORE INSERT ON study_participants
    FOR EACH ROW
    EXECUTE FUNCTION check_study_participant_limit();

  -- Create files table with size limits
  CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 255),
    size INTEGER NOT NULL CHECK (size > 0 AND size <= 104857600), -- 100MB limit
    type TEXT NOT NULL,
    path TEXT NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT files_type_check CHECK (
      type = ANY (ARRAY[
        'image/jpeg', 'image/png', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ])
    )
  );

  -- Create analytics table with partitioning
  CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event TEXT NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  ) PARTITION BY RANGE (created_at);

  -- Create monthly partitions for analytics
  CREATE TABLE IF NOT EXISTS analytics_y2024m01 PARTITION OF analytics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  CREATE TABLE IF NOT EXISTS analytics_y2024m02 PARTITION OF analytics
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
  CREATE TABLE IF NOT EXISTS analytics_y2024m03 PARTITION OF analytics
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
  CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
  CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);

  CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);
  CREATE INDEX IF NOT EXISTS profiles_preferences_gin_idx ON profiles USING gin (preferences);

  CREATE INDEX IF NOT EXISTS projects_owner_id_idx ON projects (owner_id);
  CREATE INDEX IF NOT EXISTS projects_status_idx ON projects (status);
  CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);
  CREATE INDEX IF NOT EXISTS projects_team_ids_gin_idx ON projects USING gin (team_ids);
  CREATE INDEX IF NOT EXISTS projects_name_trgm_idx ON projects USING gin (name gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS studies_project_id_idx ON studies (project_id);
  CREATE INDEX IF NOT EXISTS studies_type_idx ON studies (type);
  CREATE INDEX IF NOT EXISTS studies_status_idx ON studies (status);
  CREATE INDEX IF NOT EXISTS studies_created_at_idx ON studies (created_at DESC);
  CREATE INDEX IF NOT EXISTS studies_title_trgm_idx ON studies USING gin (title gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS study_participants_study_id_idx ON study_participants (study_id);
  CREATE INDEX IF NOT EXISTS study_participants_user_id_idx ON study_participants (user_id);
  CREATE INDEX IF NOT EXISTS study_participants_status_idx ON study_participants (status);
  CREATE INDEX IF NOT EXISTS study_participants_created_at_idx ON study_participants (created_at DESC);

  CREATE INDEX IF NOT EXISTS files_owner_id_idx ON files (owner_id);
  CREATE INDEX IF NOT EXISTS files_project_id_idx ON files (project_id);
  CREATE INDEX IF NOT EXISTS files_study_id_idx ON files (study_id);
  CREATE INDEX IF NOT EXISTS files_created_at_idx ON files (created_at DESC);
  CREATE INDEX IF NOT EXISTS files_name_trgm_idx ON files USING gin (name gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS analytics_user_id_idx ON analytics (user_id);
  CREATE INDEX IF NOT EXISTS analytics_event_idx ON analytics (event);
  CREATE INDEX IF NOT EXISTS analytics_created_at_idx ON analytics (created_at DESC);

  -- Enable Row Level Security
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE study_participants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE files ENABLE ROW LEVEL SECURITY;
  ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can view their own profile" ON users;
  DROP POLICY IF EXISTS "Users can update their own profile" ON users;
  DROP POLICY IF EXISTS "Users can view their own preferences" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own preferences" ON profiles;
  DROP POLICY IF EXISTS "Researchers can create projects" ON projects;
  DROP POLICY IF EXISTS "Users can view projects they own or are part of" ON projects;
  DROP POLICY IF EXISTS "Owners can update their projects" ON projects;
  DROP POLICY IF EXISTS "Owners can delete their projects" ON projects;
  DROP POLICY IF EXISTS "Researchers can create studies" ON studies;
  DROP POLICY IF EXISTS "Users can view studies they have access to" ON studies;
  DROP POLICY IF EXISTS "Owners can update their studies" ON studies;
  DROP POLICY IF EXISTS "Owners can delete their studies" ON studies;
  DROP POLICY IF EXISTS "Participants can view their participations" ON study_participants;
  DROP POLICY IF EXISTS "Researchers can view their study participants" ON study_participants;
  DROP POLICY IF EXISTS "Users can view files they have access to" ON files;
  DROP POLICY IF EXISTS "Users can upload files" ON files;
  DROP POLICY IF EXISTS "Users can update their files" ON files;
  DROP POLICY IF EXISTS "Users can delete their files" ON files;
  DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics;

  -- Recreate policies
  CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

  CREATE POLICY "Users can view their own preferences"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own preferences"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Researchers can create projects"
    ON projects FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'researcher'
      )
    );

  CREATE POLICY "Users can view projects they own or are part of"
    ON projects FOR SELECT
    USING (
      owner_id = auth.uid() OR
      auth.uid() = ANY(team_ids)
    );

  CREATE POLICY "Owners can update their projects"
    ON projects FOR UPDATE
    USING (owner_id = auth.uid());

  CREATE POLICY "Owners can delete their projects"
    ON projects FOR DELETE
    USING (owner_id = auth.uid());

  CREATE POLICY "Researchers can create studies"
    ON studies FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.owner_id = auth.uid()
      )
    );

  CREATE POLICY "Users can view studies they have access to"
    ON studies FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND (
          projects.owner_id = auth.uid() OR
          auth.uid() = ANY(projects.team_ids) OR
          EXISTS (
            SELECT 1 FROM study_participants
            WHERE study_participants.study_id = studies.id
            AND study_participants.user_id = auth.uid()
          )
        )
      )
    );

  CREATE POLICY "Owners can update their studies"
    ON studies FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.owner_id = auth.uid()
      )
    );

  CREATE POLICY "Owners can delete their studies"
    ON studies FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.owner_id = auth.uid()
      )
    );

  CREATE POLICY "Participants can view their participations"
    ON study_participants FOR SELECT
    USING (user_id = auth.uid());

  CREATE POLICY "Researchers can view their study participants"
    ON study_participants FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM studies
        JOIN projects ON studies.project_id = projects.id
        WHERE study_participants.study_id = studies.id
        AND projects.owner_id = auth.uid()
      )
    );

  CREATE POLICY "Users can view files they have access to"
    ON files FOR SELECT
    USING (
      owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = files.project_id
        AND (
          projects.owner_id = auth.uid() OR
          auth.uid() = ANY(projects.team_ids)
        )
      ) OR
      EXISTS (
        SELECT 1 FROM studies
        JOIN projects ON studies.project_id = projects.id
        WHERE studies.id = files.study_id
        AND (
          projects.owner_id = auth.uid() OR
          auth.uid() = ANY(projects.team_ids)
        )
      )
    );

  CREATE POLICY "Users can upload files"
    ON files FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

  CREATE POLICY "Users can update their files"
    ON files FOR UPDATE
    USING (owner_id = auth.uid());

  CREATE POLICY "Users can delete their files"
    ON files FOR DELETE
    USING (owner_id = auth.uid());

  CREATE POLICY "Users can view their own analytics"
    ON analytics FOR SELECT
    USING (user_id = auth.uid());

  RAISE NOTICE 'Migration version 1 completed successfully';
END $$;

-- Create functions and triggers
DO $$
BEGIN
  -- Function to handle new user creation
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Create user profile
    INSERT INTO users (
      id,
      email,
      first_name,
      last_name,
      role,
      organization
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      (NEW.raw_user_meta_data->>'role')::user_role,
      NEW.raw_user_meta_data->>'organization'
    );

    -- Create default profile
    INSERT INTO profiles (user_id)
    VALUES (NEW.id);

    RETURN NEW;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Function to update timestamps
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Function to handle study completion
  CREATE OR REPLACE FUNCTION handle_study_completion()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
      NEW.completed_at = CURRENT_TIMESTAMP;
      
      -- Update study statistics
      UPDATE studies
      SET metadata = jsonb_set(
        metadata,
        '{completion_stats}',
        (
          COALESCE(metadata->'completion_stats', '{}'::jsonb) || 
          jsonb_build_object(
            'last_completion', CURRENT_TIMESTAMP,
            'total_completed', (
              SELECT COUNT(*)
              FROM study_participants sp
              WHERE sp.study_id = NEW.study_id
              AND sp.status = 'completed'
            )
          )
        )::jsonb
      )
      WHERE id = NEW.study_id;
    END IF;
    RETURN NEW;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error in handle_study_completion: %', SQLERRM;
      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  -- Function to handle user activity tracking
  CREATE OR REPLACE FUNCTION track_user_activity()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Update last_sign_in for users
    IF TG_TABLE_NAME = 'auth' AND TG_OP = 'UPDATE' THEN
      UPDATE users
      SET last_sign_in = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END IF;
    RETURN NEW;
  EXCEPTION
    WHEN others THEN
      RAISE NOTICE 'Error in track_user_activity: %', SQLERRM;
      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  -- Create triggers for user management
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

  DROP TRIGGER IF EXISTS on_auth_user_activity ON auth.users;
  CREATE TRIGGER on_auth_user_activity
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION track_user_activity();

  -- Create triggers for timestamp updates
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
  CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_studies_updated_at ON studies;
  CREATE TRIGGER update_studies_updated_at
    BEFORE UPDATE ON studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_study_participants_updated_at ON study_participants;
  CREATE TRIGGER update_study_participants_updated_at
    BEFORE UPDATE ON study_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_files_updated_at ON files;
  CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Create trigger for study completion handling
  DROP TRIGGER IF EXISTS handle_study_participant_completion ON study_participants;
  CREATE TRIGGER handle_study_participant_completion
    BEFORE UPDATE ON study_participants
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION handle_study_completion();

  RAISE NOTICE 'Created all functions and triggers successfully';
END $$;

-- Add audit logging
DO $$
BEGIN
  -- Create audit log table
  CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    client_info JSONB
  ) PARTITION BY RANGE (changed_at);

  -- Create monthly partitions for audit logs
  CREATE TABLE IF NOT EXISTS audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  CREATE TABLE IF NOT EXISTS audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
  CREATE TABLE IF NOT EXISTS audit_logs_y2024m03 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

  -- Create audit logging function
  CREATE OR REPLACE FUNCTION log_audit_event()
  RETURNS TRIGGER AS $$
  DECLARE
    audit_data JSONB;
    excluded_cols TEXT[] := ARRAY['created_at', 'updated_at'];
  BEGIN
    -- Build audit data
    audit_data := jsonb_build_object(
      'session_id', current_setting('request.jwt.claims', true)::jsonb->>'session_id',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    );

    -- Record the audit event
    IF (TG_OP = 'DELETE') THEN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        changed_by,
        client_info
      )
      VALUES (
        TG_TABLE_NAME,
        OLD.id,
        TG_OP,
        to_jsonb(OLD),
        auth.uid(),
        audit_data
      );
      RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        changed_by,
        client_info
      )
      VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        to_jsonb(OLD),
        to_jsonb(NEW),
        auth.uid(),
        audit_data
      );
      RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
      INSERT INTO audit_logs (
        table_name,
        record_id,
        operation,
        new_data,
        changed_by,
        client_info
      )
      VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        to_jsonb(NEW),
        auth.uid(),
        audit_data
      );
      RETURN NEW;
    END IF;
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create audit triggers for all tables
  CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  CREATE TRIGGER audit_projects
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  CREATE TRIGGER audit_studies
    AFTER INSERT OR UPDATE OR DELETE ON studies
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  CREATE TRIGGER audit_study_participants
    AFTER INSERT OR UPDATE OR DELETE ON study_participants
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  CREATE TRIGGER audit_files
    AFTER INSERT OR UPDATE OR DELETE ON files
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

  -- Create indexes for audit logs
  CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON audit_logs (table_name);
  CREATE INDEX IF NOT EXISTS audit_logs_record_id_idx ON audit_logs (record_id);
  CREATE INDEX IF NOT EXISTS audit_logs_changed_by_idx ON audit_logs (changed_by);
  CREATE INDEX IF NOT EXISTS audit_logs_changed_at_idx ON audit_logs (changed_at DESC);
  CREATE INDEX IF NOT EXISTS audit_logs_operation_idx ON audit_logs (operation);

  -- Enable RLS for audit logs
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

  -- Create audit log policies
  CREATE POLICY "Researchers can view audit logs for their projects"
    ON audit_logs FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = audit_logs.record_id
        AND projects.owner_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM studies
        JOIN projects ON studies.project_id = projects.id
        WHERE studies.id = audit_logs.record_id
        AND projects.owner_id = auth.uid()
      )
    );

  RAISE NOTICE 'Created audit logging system successfully';
END $$;

-- Add enhanced analytics
DO $$
BEGIN
  -- Create analytics functions
  CREATE OR REPLACE FUNCTION track_event(
    event_name TEXT,
    event_properties JSONB DEFAULT '{}'::jsonb,
    user_id UUID DEFAULT auth.uid()
  )
  RETURNS UUID AS $$
  DECLARE
    event_id UUID;
  BEGIN
    INSERT INTO analytics (
      event,
      properties,
      user_id,
      session_id,
      created_at
    ) VALUES (
      event_name,
      event_properties,
      user_id,
      current_setting('request.jwt.claims', true)::jsonb->>'session_id',
      CURRENT_TIMESTAMP
    ) RETURNING id INTO event_id;

    RETURN event_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Create analytics views
  CREATE OR REPLACE VIEW study_completion_stats AS
  SELECT
    s.id AS study_id,
    s.title AS study_title,
    p.id AS project_id,
    p.name AS project_name,
    COUNT(sp.id) AS total_participants,
    COUNT(sp.id) FILTER (WHERE sp.status = 'completed') AS completed_participants,
    AVG(EXTRACT(EPOCH FROM (sp.completed_at - sp.started_at))) FILTER (WHERE sp.status = 'completed') AS avg_completion_time_seconds,
    jsonb_agg(DISTINCT sp.feedback) FILTER (WHERE sp.feedback IS NOT NULL) AS all_feedback
  FROM studies s
  JOIN projects p ON s.project_id = p.id
  LEFT JOIN study_participants sp ON s.id = sp.study_id
  GROUP BY s.id, s.title, p.id, p.name;

  -- Create materialized view for daily analytics
  CREATE MATERIALIZED VIEW IF NOT EXISTS daily_analytics AS
  SELECT
    DATE_TRUNC('day', created_at) AS day,
    event,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_id) AS unique_users,
    jsonb_object_agg(
      COALESCE(properties->>'category', 'uncategorized'),
      COUNT(*)
    ) AS category_counts
  FROM analytics
  GROUP BY DATE_TRUNC('day', created_at), event
  WITH DATA;

  -- Create index on materialized view
  CREATE UNIQUE INDEX IF NOT EXISTS daily_analytics_day_event_idx 
  ON daily_analytics (day, event);

  -- Create function to refresh materialized view
  CREATE OR REPLACE FUNCTION refresh_daily_analytics()
  RETURNS TRIGGER AS $$
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_analytics;
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  -- Create trigger to refresh materialized view
  DROP TRIGGER IF EXISTS refresh_daily_analytics_trigger ON analytics;
  CREATE TRIGGER refresh_daily_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON analytics
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_daily_analytics();

  -- Create analytics helper functions
  CREATE OR REPLACE FUNCTION get_study_stats(study_id UUID)
  RETURNS TABLE (
    metric TEXT,
    value JSONB
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT
      m.metric,
      m.value
    FROM (
      SELECT 'total_participants'::TEXT AS metric,
        to_jsonb(COUNT(*)) AS value
      FROM study_participants
      WHERE study_id = $1
      UNION ALL
      SELECT 'completion_rate'::TEXT,
        to_jsonb(
          ROUND(
            COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC /
            NULLIF(COUNT(*)::NUMERIC, 0) * 100,
            2
          )
        )
      FROM study_participants
      WHERE study_id = $1
      UNION ALL
      SELECT 'avg_completion_time'::TEXT,
        to_jsonb(
          EXTRACT(EPOCH FROM AVG(completed_at - started_at))
        )
      FROM study_participants
      WHERE study_id = $1
      AND status = 'completed'
      UNION ALL
      SELECT 'feedback_summary'::TEXT,
        jsonb_build_object(
          'average_rating',
          AVG((feedback->>'rating')::NUMERIC),
          'common_issues',
          jsonb_agg(DISTINCT jsonb_array_elements_text(feedback->'technical_issues'))
        )
      FROM study_participants
      WHERE study_id = $1
      AND feedback IS NOT NULL
    ) m;
  END;
  $$ LANGUAGE plpgsql;

  RAISE NOTICE 'Created enhanced analytics system successfully';
END $$;

-- Add data validation functions
DO $$
BEGIN
  -- Create validation functions
  CREATE OR REPLACE FUNCTION validate_email(email TEXT)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;

  CREATE OR REPLACE FUNCTION validate_phone(phone TEXT)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN phone ~* '^\+?[0-9\s-()]{8,}$';
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;

  CREATE OR REPLACE FUNCTION validate_json_schema(
    data JSONB,
    schema JSONB
  )
  RETURNS BOOLEAN AS $$
  DECLARE
    field RECORD;
  BEGIN
    -- Check required fields
    FOR field IN SELECT * FROM jsonb_each(schema->'required')
    LOOP
      IF data->>field.value IS NULL THEN
        RAISE EXCEPTION 'Missing required field: %', field.value
          USING HINT = 'Please provide all required fields',
                ERRCODE = 'check_violation';
      END IF;
    END LOOP;

    -- Check field types
    FOR field IN SELECT * FROM jsonb_each(schema->'properties')
    LOOP
      IF data->>field.key IS NOT NULL THEN
        CASE field.value->>'type'
          WHEN 'string' THEN
            IF jsonb_typeof(data->field.key) != 'string' THEN
              RAISE EXCEPTION 'Invalid type for field %: expected string', field.key;
            END IF;
          WHEN 'number' THEN
            IF jsonb_typeof(data->field.key) != 'number' THEN
              RAISE EXCEPTION 'Invalid type for field %: expected number', field.key;
            END IF;
          WHEN 'boolean' THEN
            IF jsonb_typeof(data->field.key) != 'boolean' THEN
              RAISE EXCEPTION 'Invalid type for field %: expected boolean', field.key;
            END IF;
          WHEN 'array' THEN
            IF jsonb_typeof(data->field.key) != 'array' THEN
              RAISE EXCEPTION 'Invalid type for field %: expected array', field.key;
            END IF;
          WHEN 'object' THEN
            IF jsonb_typeof(data->field.key) != 'object' THEN
              RAISE EXCEPTION 'Invalid type for field %: expected object', field.key;
            END IF;
        END CASE;
      END IF;
    END LOOP;

    RETURN TRUE;
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;

  -- Create study settings validation function
  CREATE OR REPLACE FUNCTION validate_study_settings(settings JSONB)
  RETURNS BOOLEAN AS $$
  DECLARE
    schema JSONB := '{
      "required": ["max_participants", "reward_amount", "estimated_duration", "auto_approve"],
      "properties": {
        "max_participants": {"type": "number", "minimum": 1, "maximum": 1000},
        "reward_amount": {"type": "number", "minimum": 0},
        "estimated_duration": {"type": "number", "minimum": 1},
        "auto_approve": {"type": "boolean"}
      }
    }'::jsonb;
  BEGIN
    RETURN validate_json_schema(settings, schema);
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;

  -- Create target audience validation function
  CREATE OR REPLACE FUNCTION validate_target_audience(audience JSONB)
  RETURNS BOOLEAN AS $$
  DECLARE
    schema JSONB := '{
      "required": ["age_range", "gender", "location", "languages"],
      "properties": {
        "age_range": {
          "type": "array",
          "minItems": 2,
          "maxItems": 2
        },
        "gender": {
          "type": "array",
          "items": {"type": "string"}
        },
        "location": {
          "type": "array",
          "items": {"type": "string"}
        },
        "languages": {
          "type": "array",
          "items": {"type": "string"}
        },
        "criteria": {"type": "object"}
      }
    }'::jsonb;
  BEGIN
    RETURN validate_json_schema(audience, schema);
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;

  -- Add validation triggers
  CREATE OR REPLACE FUNCTION validate_study_data()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Validate settings
    IF NOT validate_study_settings(NEW.settings) THEN
      RAISE EXCEPTION 'Invalid study settings'
        USING HINT = 'Check the study settings schema',
              ERRCODE = 'check_violation';
    END IF;

    -- Validate target audience
    IF NOT validate_target_audience(NEW.target_audience) THEN
      RAISE EXCEPTION 'Invalid target audience'
        USING HINT = 'Check the target audience schema',
              ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create validation trigger for studies
  DROP TRIGGER IF EXISTS validate_study ON studies;
  CREATE TRIGGER validate_study
    BEFORE INSERT OR UPDATE ON studies
    FOR EACH ROW
    EXECUTE FUNCTION validate_study_data();

  RAISE NOTICE 'Created data validation functions successfully';
END $$; 