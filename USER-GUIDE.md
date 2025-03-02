# Afkar Platform User Guide

## Database Migration Fix & New Features

This guide will walk you through the recent updates to the Afkar platform, including fixes for database migration issues and the new features for creating projects and studies.

## 1. Fixing Database Migration Issues

The platform was experiencing a "Database error saving new user" during registration due to issues with the database migration. We've fixed this by:

1. **Creating a safer migration script**: The new script at `supabase/migrations/20240315120000_fix_existing_types.sql` properly checks if types exist before trying to create them.

2. **Improving the trigger function**: The enhanced `handle_new_user` function now has better error handling and can recover from various edge cases.

### Applying the Fix

Follow these steps to apply the database fix:

1. **Access the SQL Editor** in your Supabase Dashboard
2. Create a new query called "Fix Types Migration"
3. Paste the contents of `supabase/migrations/20240315120000_fix_existing_types.sql`
4. Run this migration

For more detailed instructions, refer to the `MIGRATION.md` file.

## 2. New Features Overview

We've added several new features to improve your experience:

### Home Page

- **Role-based Dashboard**: Different views for researchers and participants
- **Project Status**: Shows your existing projects or guides you to create your first one
- **Studies Section**: Once you have projects, you can create and manage studies

### Project Management

- **Create Projects**: Easily create new research projects
- **Project Settings**: Control privacy, comments, and approval settings
- **Team Access**: Projects can be shared with team members

### Study Creation

- **Create Studies**: Set up research studies linked to your projects
- **Study Types**: Support for usability tests and interviews
- **Participant Management**: Control participant access and approval

## 3. User Flows

### Researcher Flow

1. **Sign Up/Login**: Create an account or log in with researcher role
2. **Create a Project**: From the home page, click "New Project"
3. **Fill Project Details**: Add name, description, and settings
4. **Create a Study**: From the home page or projects page, click "New Study"
5. **Configure Study**: Set study parameters, rewards, and duration
6. **Publish**: Make the study available to participants

### Participant Flow

1. **Sign Up/Login**: Create an account or log in with participant role
2. **Browse Studies**: Explore available research studies
3. **Join a Study**: Sign up for studies that interest you
4. **Complete Tasks**: Follow instructions to complete the research tasks
5. **Receive Rewards**: Get compensation for completed studies

## 4. Troubleshooting Common Issues

### Registration Problems

If you still experience registration issues:

1. Check the browser console for specific error messages
2. Verify that the migration has been applied successfully
3. Ensure your environment variables are set correctly

### Study Creation Issues

If you have trouble creating studies:

1. Make sure you have at least one project created first
2. Check that you have the correct permissions (researcher role)
3. Verify the form data meets all validation requirements

## 5. Next Steps

The platform will continue to evolve with these planned features:

- **Advanced Analytics**: More detailed insights for researchers
- **Collaborative Features**: Better tools for team collaboration
- **Participant Matching**: Improved targeting for specific demographics

For any questions or support, please contact the development team.

Thank you for using Afkar Platform!

---

 