import { and, count, eq, ilike, not, or, sql } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { colleges, profiles } from '@/lib/db/schema/core';
import { compatibilityScore } from '@/lib/compatibility';

export async function searchPartners(input: {
  currentUserId: string;
  q?: string;
  skill?: string;
  collegeId?: string;
  role?: string;
  page: number;
  pageSize: number;
}) {
  const db = getCoreDb();
  const conditions = [eq(profiles.isOpenToTeam, true), not(eq(profiles.id, input.currentUserId))];
  if (input.q) {
    conditions.push(
      or(
        ilike(profiles.fullName, `%${input.q}%`),
        ilike(profiles.username, `%${input.q}%`),
        ilike(profiles.studentCode, `%${input.q}%`),
      ) as typeof conditions[number],
    );
  }
  if (input.skill) conditions.push(sql`${profiles.skills} @> ARRAY[${input.skill}]::text[]`);
  if (input.collegeId) conditions.push(eq(profiles.collegeId, input.collegeId));
  if (input.role) conditions.push(eq(profiles.rolePreference, input.role));

  const where = and(...conditions);
  const offset = (input.page - 1) * input.pageSize;
  const [rows, totalRows, currentRows] = await Promise.all([
    db.select({ profile: profiles, college: colleges }).from(profiles).leftJoin(colleges, eq(profiles.collegeId, colleges.id)).where(where).limit(input.pageSize).offset(offset),
    db.select({ total: count() }).from(profiles).where(where),
    db.select().from(profiles).where(eq(profiles.id, input.currentUserId)).limit(1),
  ]);

  const current = currentRows[0];
  const data = rows
    .map((row) => {
      const match = current ? compatibilityScore(current, row.profile) : { score: 0, reasons: [] };
      return { ...row.profile, college: row.college, compatibility: match };
    })
    .sort((a, b) => b.compatibility.score - a.compatibility.score);

  return { rows: data, total: Number(totalRows[0]?.total ?? 0), page: input.page, pageSize: input.pageSize };
}
