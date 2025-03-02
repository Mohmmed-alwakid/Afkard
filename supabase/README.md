# Supabase Migration Setup

This directory contains SQL migrations for the AfkarD database schema.

## Prerequisites

1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. Supabase project created

## Running Migrations

To apply the migrations to your Supabase project, use one of the following methods:

### Using Supabase CLI

1. Log in to the Supabase CLI:
   ```bash
   supabase login
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migrations:
   ```bash
   supabase db push
   ```

### Manual Application

If you prefer to apply the migrations manually:

1. Open the Supabase dashboard for your project
2. Go to the SQL Editor
3. Copy the contents of each migration file in the `migrations` directory
4. Paste and execute the SQL in order (starting with `00001_initial_schema.sql`)

## Migration Files

- `00001_initial_schema.sql`: Initial database schema setup

## Database Schema Overview

The schema includes the following main tables:

- `users`: Extends Supabase auth.users with additional profile information
- `profiles`: User preference settings
- `projects`: Research projects
- `studies`: Individual studies within projects
- `study_participants`: Links participants to studies
- `files`: Uploaded files related to projects/studies
- `analytics`: Event tracking

## Row-Level Security (RLS)

The migrations include RLS policies that control access to data:

- Users can only see their own data
- Project owners and team members can see project data
- Study participants can see studies they're participating in

## Troubleshooting

If you encounter the "Database error saving new user" during registration:

1. Check if the schema was applied correctly
2. Ensure the database triggers are working properly
3. Check Supabase logs for specific error details
4. Verify that the `user_role` enum type includes all necessary roles

## Schema Updates

When updating the schema:

1. Create a new migration file with a sequential number (e.g., `00002_add_new_table.sql`)
2. Update the TypeScript type definitions in `src/types/database.ts`
3. Apply the migration using the methods above 