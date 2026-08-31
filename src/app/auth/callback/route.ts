import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { ensureStudentProfile } from '@/lib/profile/student';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/profile';

  // Supabase may redirect back with an error (e.g. user denied consent)
  if (error) {
    console.error('Auth callback received error from provider:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code) {
    console.error('Auth callback: no code parameter in URL. Full URL:', request.url);
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
  }

  const supabase = await createClient();
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Auth callback: exchangeCodeForSession failed:', exchangeError.message, exchangeError);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  if (!data.user) {
    console.error('Auth callback: exchangeCodeForSession returned no user');
    return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
  }

  let redirectPath = next;

  if (hasCoreDatabase()) {
    try {
      await ensureStudentProfile(data.user);
    } catch (e) {
      console.error('Failed to auto-provision Neon student profile on callback:', e);
      redirectPath = '/profile';
    }
  }

  const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
  const isLocalEnv = process.env.NODE_ENV === 'development';
  if (isLocalEnv) {
    // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
    return NextResponse.redirect(`${origin}${redirectPath}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
  } else {
    return NextResponse.redirect(`${origin}${redirectPath}`);
  }
}
