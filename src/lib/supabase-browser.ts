import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const supabase = createClientComponentClient<Database>();

// Add the createClient function for backward compatibility
export function createClient() {
  return supabase;
} 