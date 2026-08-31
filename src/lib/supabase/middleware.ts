import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
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

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Keep the old page in the codebase, but hide it from the active product flow.
  if (pathname === '/onboarding') {
    return NextResponse.redirect(new URL(user ? '/profile' : '/sign-in', request.url));
  }

  // Redirect authenticated users from landing page to discover
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/discover', request.url));
  }

  // Unverified users can edit their profile, but cannot use the rest of the app.
  if (user && pathname !== '/profile' && process.env.CORE_DATABASE_URL) {
    try {
      // Lightweight check: query whether the profile has verified a college email.
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.CORE_DATABASE_URL);
      const rows = await sql`SELECT college_id FROM profiles WHERE id = ${user.id} LIMIT 1`;
      const profile = rows[0];

      if (!profile || !profile.college_id) {
        const profileUrl = new URL('/profile', request.url);
        return NextResponse.redirect(profileUrl);
      }
    } catch (e) {
      // If DB check fails, don't block the user — let them through
      console.error('Middleware verification check failed:', e);
    }
  }

  return supabaseResponse;
}
