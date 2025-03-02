# AfkarD Setup Guide

This document provides instructions for setting up the AfkarD application with Supabase as the backend.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local development)
- A Supabase project (create one at [supabase.com](https://supabase.com))

## Setup Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if you haven't already)
git clone <your-repo-url>
cd AfkarD

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Setup

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# You can find these in your Supabase project dashboard
```

Update the following variables in your `.env.local` file:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)

### 3. Database Schema Setup

You need to set up the database schema in your Supabase project. There are two ways to do this:

#### Option 1: Using Supabase Dashboard (Recommended for First-Time Setup)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/00001_initial_schema.sql`
4. Paste and execute the SQL in the editor

#### Option 2: Using Supabase CLI (For Development)

```bash
# Initialize Supabase (if not already done)
npx supabase init --force

# Start local Supabase instance
npx supabase start

# Push the migrations
npx supabase db push
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Troubleshooting

### "Database error saving new user"

If you encounter this error during user registration:

1. Check if the database schema was applied correctly
2. Verify that the `user_role` enum type includes all necessary roles
3. Check the Supabase database logs for specific error details
4. Ensure all triggers and functions are properly created

### Authentication Issues

1. Verify your Supabase project's authentication settings
2. Ensure Email provider is enabled in Auth > Providers
3. Set up proper redirect URLs in Auth > URL Configuration

### Schema Updates

If you need to modify the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Update the TypeScript types in `src/types/database.ts`
3. Apply the migration using the Supabase dashboard or CLI

## Next Steps

- Set up email verification (recommended for production)
- Configure additional authentication providers if needed
- Customize UI components to match your branding
- Review and adjust row-level security policies for your specific needs 