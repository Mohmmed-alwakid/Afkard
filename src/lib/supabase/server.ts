import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type ExtendedDatabase } from '@/types/supabase'

export async function createServerClient() {
  const cookieStore = cookies()
  return createServerComponentClient<ExtendedDatabase>({
    cookies: () => cookieStore
  })
} 