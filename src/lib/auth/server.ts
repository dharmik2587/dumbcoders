import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/env';

export async function getOptionalUser() {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch (error) {
    console.error('getOptionalUser error:', error);
    return null;
  }
}

export async function getOptionalUserId(): Promise<string | null> {
  const user = await getOptionalUser();
  return user?.id ?? null;
}

export async function requireUser() {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthenticated');
  }

  return user;
}

export async function requireUserId(): Promise<string> {
  const user = await requireUser();
  return user.id;
}
