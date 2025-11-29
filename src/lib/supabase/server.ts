import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  console.log('=== createClient (server) START ===');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase config:', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    keyLength: supabaseKey?.length,
    urlValid: supabaseUrl?.startsWith('https://'),
  });
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase environment variables!');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseKey);
    throw new Error('Missing Supabase environment variables');
  }
  
  const cookieStore = await cookies();
  console.log('Cookies loaded, count:', cookieStore.getAll().length);

  const client = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.warn('Failed to set cookies:', error);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  
  console.log('=== createClient (server) END ===');
  return client;
}
