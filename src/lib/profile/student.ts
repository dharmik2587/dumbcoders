import { eq, or } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { colleges, githubData, profiles, type Profile } from '@/lib/db/schema/core';
import type { User } from '@supabase/supabase-js';
import { usernameBase, usernameCandidate } from './username';

/**
 * Generates a unique student code e.g. HM-7A9B2K
 */
export function generateStudentCode(userId: string): string {
  const hash = userId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `HM-${hash}`;
}

/**
 * Ensures a profile exists in Neon database for a Supabase authenticated student.
 * Pulls student details from Supabase User and links via studentCode & userId.
 *
 * Key design decisions:
 * - We do NOT set `email` during initial creation — emails have a unique constraint
 *   and including it causes silent INSERT failures if the email appears in any
 *   existing row (orphaned accounts, re-signups, etc.).
 * - The email is set later via the college email OTP verification flow or PATCH /api/users/me.
 * - We use ON CONFLICT DO UPDATE on the PK (id) to handle any concurrent race conditions.
 */
export async function ensureStudentProfile(user: User): Promise<Profile | null> {
  const db = getCoreDb();
  try {
    // 1. Fast path: profile already exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existing[0]) {
      // If studentCode wasn't set previously, populate it
      if (!existing[0].studentCode) {
        const code = generateStudentCode(user.id);
        const [updated] = await db
          .update(profiles)
          .set({ studentCode: code, updatedAt: new Date() })
          .where(eq(profiles.id, user.id))
          .returning();
        return updated ?? existing[0];
      }
      return existing[0];
    }

    // 2. Create new profile
    const studentCode = generateStudentCode(user.id);
    const rawFullName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      '';
    const avatarUrl =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      null;

    const baseName = usernameBase({
      username: user.user_metadata?.user_name as string,
      email: user.email,
      userId: user.id,
    });

    // Find a unique username
    let username = baseName;
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = usernameCandidate(baseName, attempt);
      const taken = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, candidate))
        .limit(1);
      if (!taken[0]) {
        username = candidate;
        break;
      }
    }

    // NOTE: We deliberately omit `email` here to avoid unique-constraint conflicts
    // with any pre-existing row that has the same email address (e.g., orphaned rows,
    // re-signups, Google + email dual auth). Email is set via OTP verification later.
    const [created] = await db
      .insert(profiles)
      .values({
        id: user.id,
        studentCode,
        fullName: rawFullName || null,
        avatarUrl,
        username,
        skills: [],
        hackathonInterests: [],
        onboardingDone: true,
        isOpenToTeam: true,
        profileComplete: 10,
      })
      // If a concurrent request already inserted this id, update non-sensitive fields
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!created) {
      // Last resort: re-fetch in case of any edge case
      const refetch = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
      return refetch[0] ?? null;
    }

    return created;
  } catch (error) {
    console.error('ensureStudentProfile error:', error);
    // Always try to return whatever row exists for this user
    try {
      const refetch = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
      return refetch[0] ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * Look up a student by either their Supabase ID, username, or unique Student Code (HM-XXXXXX)
 */
export async function getStudentByAnyKey(identifier: string) {
  const db = getCoreDb();
  const rows = await db
    .select({ profile: profiles, college: colleges, github: githubData })
    .from(profiles)
    .leftJoin(colleges, eq(profiles.collegeId, colleges.id))
    .leftJoin(githubData, eq(profiles.id, githubData.userId))
    .where(
      or(
        eq(profiles.id, identifier),
        eq(profiles.username, identifier.toLowerCase()),
        eq(profiles.studentCode, identifier.toUpperCase()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
