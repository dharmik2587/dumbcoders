import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/env';

export async function getOptionalUser(token?: string) {
  if (!hasSupabaseConfig()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
    return user ?? null;
  } catch (error) {
    console.error('getOptionalUser error:', error);
    return null;
  }
}

export async function getOptionalUserId(token?: string): Promise<string | null> {
  const user = await getOptionalUser(token);
  return user?.id ?? null;
}

export async function requireUser(token?: string) {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthenticated');
  }

  return user;
}

export async function requireUserId(token?: string): Promise<string> {
  const user = await requireUser(token);
  return user.id;
}
