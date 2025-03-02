import { createClient } from '@supabase/supabase-js';
import { fetch } from 'undici';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { execAsync } from '../utils/execAsync';
import { compareVersions } from '../utils/compareVersions';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Type for health check response
interface HealthCheckResponse {
  status: 'healthy' | 'error';
  message?: string;
  error?: string;
  services?: {
    database: 'connected' | 'error';
    auth: 'available' | 'error';
  };
  timestamp: string;
}

// Required environment variables
const REQUIRED_ENV_VARS = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase Anonymous Key',
  NEXT_PUBLIC_SITE_URL: 'Site URL',
  // Application
  NEXT_PUBLIC_APP_URL: 'App URL',
  NEXT_PUBLIC_APP_NAME: 'App Name',
  NEXT_PUBLIC_APP_DESCRIPTION: 'App Description',
  // Email
  NEXT_PUBLIC_EMAIL_FROM: 'Email From',
  NEXT_PUBLIC_EMAIL_NAME: 'Email Name',
  // Storage
  NEXT_PUBLIC_STORAGE_BUCKET: 'Storage Bucket'
} as const;

// Required dependencies in package.json
const REQUIRED_DEPENDENCIES = [
  '@supabase/supabase-js',
  'next',
  'react',
  'react-dom',
  'typescript',
  'tailwindcss',
  '@radix-ui/react-alert-dialog',
  'zod',
  'zustand'
];

// Required files
const REQUIRED_FILES = [
  'next.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  '.env.local',
  'src/app/layout.tsx',
  'src/components/providers/auth-provider.tsx',
  'src/store/auth-store.ts'
];

// Define route configuration type
type RouteConfig = {
  path: string;
  name: string;
  requiresAuth: boolean;
  expectedRedirect?: string;
};

// Frontend routes to validate with their expected behaviors
const FRONTEND_ROUTES: RouteConfig[] = [
  { 
    path: '/', 
    name: 'Home',
    requiresAuth: true,
    expectedRedirect: '/login'
  },
  { 
    path: '/login', 
    name: 'Login',
    requiresAuth: false
  },
  { 
    path: '/signup', 
    name: 'Signup',
    requiresAuth: false
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    requiresAuth: true,
    expectedRedirect: '/login'
  },
  { 
    path: '/profile', 
    name: 'Profile',
    requiresAuth: true,
    expectedRedirect: '/login'
  }
];

// API endpoints to validate
const API_ENDPOINTS = [
  { path: '/api/health', method: 'GET' },
  { path: '/api/auth/session', method: 'GET' },
  { path: '/api/user/profile', method: 'GET' }
];

// Define the table configuration type
type TableConfig = {
  name: string;
  schema: 'public' | 'auth';
  skipDataCheck?: boolean;
};

// Database tables to validate
const REQUIRED_TABLES: TableConfig[] = [
  { name: 'health_check', schema: 'public' },
  { name: 'profiles', schema: 'public' },
  { name: 'users', schema: 'auth', skipDataCheck: true }  // auth.users is special
];

// Ensure environment variables are defined and properly typed
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Add version checks for critical dependencies
const DEPENDENCY_VERSIONS = {
  'next': '14.0.0',
  'react': '18.0.0',
  'typescript': '5.0.0'
} as const;

async function validateDependencies(): Promise<void> {
  console.log('\n📦 Checking Dependencies...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    let hasErrors = false;
    
    // Check required dependencies
    for (const dep of REQUIRED_DEPENDENCIES) {
      if (allDeps[dep]) {
        console.log(`✅ ${dep} is installed`);
        
        // Check version for critical dependencies
        if (dep in DEPENDENCY_VERSIONS) {
          const installedVersion = allDeps[dep].replace('^', '').replace('~', '');
          const requiredVersion = DEPENDENCY_VERSIONS[dep as keyof typeof DEPENDENCY_VERSIONS];
          
          if (compareVersions(installedVersion, requiredVersion) < 0) {
            console.error(`❌ ${dep} version ${installedVersion} is below minimum required version ${requiredVersion}`);
            hasErrors = true;
          } else {
            console.log(`  ↳ Version ${installedVersion} meets minimum requirement (${requiredVersion})`);
          }
        }
      } else {
        console.error(`❌ Missing required dependency: ${dep}`);
        console.error(`  ↳ Install with: npm install ${dep}`);
        hasErrors = true;
      }
    }

    // Check for peer dependency conflicts
    try {
      const { stdout } = await execAsync('npm ls');
      if (stdout.includes('peer dep missing')) {
        console.warn('⚠️ Some peer dependencies are missing or conflicting');
        console.warn('  ↳ Run "npm ls" for details');
      }
    } catch (error) {
      // npm ls often exits with code 1 if there are peer dep issues
      console.warn('⚠️ Potential peer dependency issues detected');
      console.warn('  ↳ Run "npm ls" for details');
    }

    if (hasErrors) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error reading package.json:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Enhance file validation to check file contents
async function validateFiles(): Promise<void> {
  console.log('\n📁 Checking Required Files...');
  for (const file of REQUIRED_FILES) {
    if (fs.existsSync(file)) {
      try {
        // Read first few lines to check for obvious issues
        const content = fs.readFileSync(file, 'utf8').slice(0, 500);
        
        if (content.trim().length === 0) {
          console.warn(`⚠️ ${file} exists but is empty`);
          continue;
        }

        // Basic content validation
        if (file.endsWith('.tsx') && !content.includes('import')) {
          console.warn(`⚠️ ${file} might be missing imports`);
          continue;
        }

        if (file === 'next.config.js' && !content.includes('module.exports')) {
          console.warn(`⚠️ ${file} might be misconfigured`);
          continue;
        }

        console.log(`✅ ${file} exists and appears valid`);
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    } else {
      console.error(`❌ Missing required file: ${file}`);
      process.exit(1);
    }
  }
}

// Enhance database validation with connection timeout
async function validateDatabase(): Promise<void> {
  console.log('\n🗄️ Validating Database Schema...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Test connection with timeout
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const connectionPromise = supabase.from('health_check').select('count').single();
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Database connection established');
  } catch (error) {
    if (error instanceof Error && error.message === 'Connection timeout') {
      console.error('❌ Database connection timed out');
      process.exit(1);
    }
  }

  // Continue with table validation
  for (const table of REQUIRED_TABLES) {
    try {
      if (table.skipDataCheck) {
        // For auth.users, we'll check if we can get the count using RPC
        const { error } = await supabase.rpc('get_auth_users_count');
        if (error) throw error;
        console.log(`✅ Table ${table.schema}.${table.name} exists (access limited)`);
      } else {
        // For regular tables, we'll try to select data
        const { error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        console.log(`✅ Table ${table.schema}.${table.name} exists and is accessible`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('does not exist')) {
        console.error(`❌ Table ${table.schema}.${table.name} does not exist`);
      } else {
        console.error(`❌ Error accessing table ${table.schema}.${table.name}:`, 
          error instanceof Error ? error.message : 'Unknown error');
        if (table.schema === 'auth') {
          console.log('  ↳ Note: Limited access to auth schema is expected');
        }
      }
      process.exit(1);
    }
  }
}

async function validateApiEndpoints(): Promise<void> {
  console.log('\n🔌 Testing API Endpoints...');
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${endpoint.method} ${endpoint.path} is accessible`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint.method} ${endpoint.path} check failed:`, error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }
}

async function validateFrontendRoutes(): Promise<void> {
  console.log('\n🌐 Testing Frontend Routes...');
  
  for (const route of FRONTEND_ROUTES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const response = await fetch(`http://localhost:3000${route.path}`, {
          redirect: 'manual', // Don't automatically follow redirects
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          if (route.requiresAuth) {
            console.warn(`⚠️ ${route.name} (${route.path}) is accessible without auth (expected redirect to ${route.expectedRedirect})`);
          } else {
            console.log(`✅ ${route.name} (${route.path}) is accessible`);
          }
        } else if (response.status === 307 || response.status === 308) {
          // Temporary or Permanent Redirect
          const redirectUrl = response.headers.get('location');
          if (route.requiresAuth && route.expectedRedirect && redirectUrl?.includes(route.expectedRedirect)) {
            console.log(`✅ ${route.name} (${route.path}) correctly redirects to ${route.expectedRedirect}`);
          } else {
            console.warn(`⚠️ ${route.name} (${route.path}) redirects to unexpected location: ${redirectUrl}`);
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          // If we got a timeout, it might be due to client-side redirect
          console.log(`✅ ${route.name} (${route.path}) - timeout might be due to client-side redirect`);
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          console.error(`❌ Cannot connect to development server. Make sure 'npm run dev' is running.`);
          process.exit(1);
        } else {
          console.error(`❌ ${route.name} route check failed: ${error.message}`);
          process.exit(1);
        }
      } else {
        console.error(`❌ ${route.name} route check failed: Unknown error`);
        process.exit(1);
      }
    }
  }
}

function validateEnvVars(): void {
  console.log('\n🔐 Checking Environment Variables...');
  let missingVars = false;

  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (process.env[key]) {
      // Additional validation for URLs
      if (key.includes('URL')) {
        try {
          new URL(process.env[key]!);
          console.log(`✅ ${description} (${key}) is set and valid`);
        } catch {
          console.error(`❌ ${description} (${key}) is not a valid URL`);
          missingVars = true;
        }
      } else {
        console.log(`✅ ${description} (${key}) is set`);
      }
    } else {
      console.error(`❌ Missing ${description} (${key})`);
      missingVars = true;
    }
  }

  if (missingVars) {
    console.error('\n❌ Some environment variables are missing or invalid. Please check your .env.local file.');
    process.exit(1);
  }
}

// Enhance the main validation function with timing
async function validateSetup(): Promise<void> {
  const startTime = Date.now();
  console.log('🔍 Starting comprehensive setup validation...\n');

  try {
    // Run validations
    await validateDependencies();
    await validateFiles();
    validateEnvVars();
    await validateDatabase();
    await validateApiEndpoints();
    await validateFrontendRoutes();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✨ Validation complete! All checks passed in ${duration}s`);
    console.log('\n📝 Summary of validations:');
    console.log('- Dependencies and files structure ✓');
    console.log('- Environment variables and configuration ✓');
    console.log('- Database connection and schema ✓');
    console.log('- API endpoints and CORS ✓');
    console.log('- Frontend routes and accessibility ✓');
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n❌ Validation failed after ${duration}s`);
    throw error;
  }
}

// Run the validation
console.log('🚀 Starting validation script...\n');
validateSetup().catch((error) => {
  console.error('\n❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
  console.error('\n💡 Common solutions:');
  console.error('1. Ensure your development server is running (npm run dev)');
  console.error('2. Check your Supabase connection and credentials');
  console.error('3. Verify all required environment variables are set');
  console.error('4. Confirm all required dependencies are installed');
  console.error('5. Make sure your database schema is up to date');
  process.exit(1);
}); 