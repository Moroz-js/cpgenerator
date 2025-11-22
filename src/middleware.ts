import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - this will automatically refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback',
  ];

  // Public proposal view routes (format: /p/[slug])
  const isPublicProposal = path.startsWith('/p/');

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isPublicProposal) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    // Preserve the original URL to redirect back after login
    url.searchParams.set('redirectTo', path);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  if (user && isPublicRoute && path !== '/auth/callback') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Check workspace access for workspace routes
  const workspaceMatch = path.match(/^\/workspace\/([^\/]+)/);
  if (user && workspaceMatch) {
    const workspaceId = workspaceMatch[1];
    
    // Skip access check for special routes like 'new'
    if (workspaceId === 'new') {
      return supabaseResponse;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workspaceId)) {
      console.log('Invalid workspace ID format:', workspaceId);
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'invalid_workspace');
      return NextResponse.redirect(url);
    }
    
    // Check if user is a member of this workspace
    const { data: membership, error } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    // If not a member, redirect to home
    if (error || !membership) {
      console.log('Workspace access denied:', { workspaceId, userId: user.id, error });
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'workspace_access_denied');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
