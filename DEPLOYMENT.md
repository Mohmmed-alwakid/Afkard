# AfkarD Deployment Guide

This guide provides instructions for deploying the AfkarD application to a development or production server.

## Prerequisites

Before deploying, ensure you have the following:

1. Node.js 18.x or later
2. PostgreSQL database (or Supabase account)
3. Vercel account (recommended for deployment)
4. Git repository with your code

## Environment Setup

Create a `.env.local` file in the root of your project with the following variables:

```
# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Email (optional)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

Replace the placeholder values with your actual configuration.

## Local Development Deployment

To deploy the application locally for development:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:migrate
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## Production Deployment with Vercel

### 1. Push your code to a Git repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Connect your repository to Vercel

1. Log in to your Vercel account
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next

### 3. Configure environment variables

Add all the environment variables from your `.env.local` file to the Vercel project settings.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Set up custom domain (optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the instructions to configure DNS

## Database Migration for Production

Before deploying to production, ensure your database schema is up to date:

1. Run migrations on your production database:
   ```bash
   SUPABASE_URL=your-production-supabase-url SUPABASE_KEY=your-production-supabase-key npm run db:migrate
   ```

## Continuous Deployment

Vercel automatically deploys your application when you push changes to your main branch. To set up a more controlled deployment workflow:

1. Create a staging environment in Vercel
2. Configure Git branch deployments:
   - `main` branch → Production
   - `develop` branch → Staging

## Monitoring and Logging

For production deployments, set up monitoring and logging:

1. Configure Vercel Analytics
2. Set up error tracking with Sentry or similar service
3. Implement server-side logging

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs in Vercel
2. Verify environment variables are correctly set
3. Ensure database migrations have been applied
4. Check for any API rate limits or service disruptions

## Security Considerations

Before going live with your production deployment:

1. Ensure all API routes are properly secured
2. Implement rate limiting for public endpoints
3. Set up proper CORS configuration
4. Enable HTTPS for all traffic
5. Regularly update dependencies

## Backup Strategy

Implement a regular backup strategy for your database:

1. Set up automated backups in Supabase
2. Periodically export data for offline storage
3. Test restoration procedures

## Support

If you need assistance with deployment, contact the AfkarD support team at support@afkard.com. 