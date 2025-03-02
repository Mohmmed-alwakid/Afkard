# Database Migration Guide for AfkarD

This guide will walk you through the process of applying database migrations for the AfkarD project using the Supabase Dashboard.

## Prerequisites

1. Access to your Supabase project dashboard
2. Administrator privileges on the database

## Migration Steps - Solving Current Issues

### For the "Type already exists" Error

Since you're experiencing an error with types that already exist, follow these steps:

1. **Access the SQL Editor** in your Supabase Dashboard
2. Create a new query called "Fix Types Migration"
3. Paste the contents of `supabase/migrations/20240315120000_fix_existing_types.sql`
4. Run this migration first, which will:
   - Check for existing types before creating them
   - Fix the user trigger function
   - Ensure profiles are created for all users

### Option 1: Using the Supabase Dashboard (Recommended)

If you're still experiencing issues after running the fix above, try this complete approach:

1. **Access the SQL Editor**:
   - Log in to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to the "SQL Editor" tab in the left sidebar

2. **Create a New Query**:
   - Click the "New Query" button
   - Copy just the function and trigger definitions from the fixed migration files

3. **Execute the Migrations**:
   - Start with the safer `20240315120000_fix_existing_types.sql` 
   - Run only the function and trigger parts of other migrations
   - Check for any errors in the console output

4. **Verify the Migration**:
   - Navigate to the "Database" → "Functions" section
   - Confirm that the `handle_new_user` function is properly created
   - Test a new user signup to ensure it works

### Option 2: Manual Database Setup

If you continue to have issues with the migrations, you can manually create the essential components:

1. **Clean up existing trigger functions**:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

2. **Create the fixed trigger function**:
```sql
-- Copy the handle_new_user function from the 20240315120000_fix_existing_types.sql file
```

## Testing After Migration Fix

After applying the fixed migration:

1. Try registering a new user through your application
2. Check the Supabase logs for any error messages
3. Verify that the user appears in both `auth.users` and `public.users` tables
4. Confirm that a row is created in the `profiles` table for the new user

## Next Steps

Once you've successfully fixed the database migrations:

1. Update your environment variables if needed
2. Make any necessary changes to your application code
3. Test the full registration and login flow

For any persistent issues, you can use the Supabase Dashboard's SQL Editor to directly query and fix data:

```sql
-- Check if users are properly synchronized
SELECT a.id, a.email, u.id, u.email 
FROM auth.users a 
LEFT JOIN public.users u ON a.id = u.id;

-- Manually fix any missing users if needed
-- Example: INSERT INTO public.users (id, email, first_name, last_name, role) 
-- VALUES ('user-id-from-auth', 'email@example.com', 'First', 'Last', 'participant');
``` 