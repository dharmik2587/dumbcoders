import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Paths that do NOT require onboarding to be completed.
 * Everything else under /(main)/* requires onboarding.
 */
const ONBOARDING_EXEMPT = new Set([
  '/sign-in',
  '/sign-up',
  '/onboarding',
]);

function isOnboardingExempt(pathname: string) {
  if (pathname === '/') return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname.startsWith('/hackathons')) return true;
  return ONBOARDING_EXEMPT.has(pathname);
}

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

  // Redirect authenticated users from landing page to discover
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/discover', request.url));
  }

  // Onboarding gate: if user is authenticated and visiting a protected route,
  // check if their profile onboarding is complete.
  if (user && !isOnboardingExempt(pathname) && process.env.CORE_DATABASE_URL) {
    try {
      // Lightweight check: query the profile's onboarding status directly
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.CORE_DATABASE_URL);
      const rows = await sql`SELECT onboarding_done, college_id FROM profiles WHERE id = ${user.id} LIMIT 1`;
      const profile = rows[0];

      // If profile doesn't exist yet or onboarding is not done, redirect to onboarding
      if (!profile || !profile.onboarding_done) {
        const onboardingUrl = new URL('/onboarding', request.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // Verification lock: if onboarding is done but college email is not verified, lock all features except /profile
      if (profile.onboarding_done && !profile.college_id) {
        if (pathname !== '/profile') {
          const profileUrl = new URL('/profile', request.url);
          return NextResponse.redirect(profileUrl);
        }
      }
    } catch (e) {
      // If DB check fails, don't block the user — let them through
      console.error('Middleware onboarding check failed:', e);
    }
  }

  return supabaseResponse;
}
