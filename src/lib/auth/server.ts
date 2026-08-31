import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/env';
import { getCoreDb } from '@/lib/db/core';
import { profiles } from '@/lib/db/schema/core';
import { eq } from 'drizzle-orm';

export async function requireVerifiedUserId(token?: string): Promise<string> {
  const userId = await requireUserId(token);
  try {
    const db = getCoreDb();
    const profile = await db.select({ collegeId: profiles.collegeId }).from(profiles).where(eq(profiles.id, userId)).limit(1);
    if (!profile[0] || !profile[0].collegeId) {
      throw new Error('Unverified');
    }
    return userId;
  } catch (err: any) {
    if (err.message === 'Unverified') throw err;
    // Database connection issues shouldn't hard-fail as unverified if we can't check
    // but the instruction says to lock features until verified.
    throw new Error('Unverified');
  }
}

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
