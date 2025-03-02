import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Test database connection
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    
    if (error) {
      console.error('Database health check failed:', error);
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    // Test auth service
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth service health check failed:', authError);
      return NextResponse.json(
        {
          status: 'error',
          message: 'Auth service unavailable',
          error: authError.message,
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        services: {
          database: 'connected',
          auth: 'available',
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Service unavailable',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}

// Disable caching for this route
export const dynamic = 'force-dynamic'; 