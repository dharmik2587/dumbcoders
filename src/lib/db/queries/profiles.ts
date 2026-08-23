import { and, eq } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { colleges, githubData, profiles } from '@/lib/db/schema/core';
import type { ProfileUpdate } from '@/lib/validations/profile';
import { calculateProfileComplete } from '@/lib/profile/completion';

export async function getProfileById(id: string) {
  const db = getCoreDb();
  const rows = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getProfileByUsername(username: string) {
  const db = getCoreDb();
  const rows = await db
    .select({ profile: profiles, college: colleges, github: githubData })
    .from(profiles)
    .leftJoin(colleges, eq(profiles.collegeId, colleges.id))
    .leftJoin(githubData, eq(profiles.id, githubData.userId))
    .where(eq(profiles.username, username))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateProfile(id: string, patch: ProfileUpdate) {
  const db = getCoreDb();
  const current = await getProfileById(id);
  if (!current) return null;

  const nextProfile = { ...current, ...patch };
  const profileComplete = calculateProfileComplete(nextProfile);
  const [updated] = await db
    .update(profiles)
    .set({
      ...patch,
      profileComplete,
      updatedAt: new Date(),
    })
    .where(and(eq(profiles.id, id)))
    .returning();

  return updated ?? null;
}

export async function findCollegeByDomain(domain: string) {
  const db = getCoreDb();
  const rows = await db
    .select()
    .from(colleges)
    .where(eq(colleges.domain, domain.toLowerCase()))
    .limit(1);
  return rows[0] ?? null;
}
