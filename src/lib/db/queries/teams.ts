import { and, eq } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { profiles, teamMembers, teamMessages, teams } from '@/lib/db/schema/core';

export async function getTeamById(teamId: string) {
  const db = getCoreDb();
  const rows = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!rows[0]) return null;
  const members = await db
    .select({ member: teamMembers, profile: profiles })
    .from(teamMembers)
    .innerJoin(profiles, eq(teamMembers.userId, profiles.id))
    .where(eq(teamMembers.teamId, teamId));
  return { team: rows[0], members };
}

export async function isTeamMember(teamId: string, userId: string) {
  const db = getCoreDb();
  const rows = await db.select({ id: teamMembers.id }).from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))).limit(1);
  return Boolean(rows[0]);
}

export async function listMyTeams(userId: string) {
  const db = getCoreDb();
  return db
    .select({ team: teams, membership: teamMembers })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .orderBy(teams.updatedAt);
}

export async function createTeamMessage(teamId: string, userId: string, content: string) {
  const db = getCoreDb();
  const [msg] = await db
    .insert(teamMessages)
    .values({
      teamId,
      userId,
      content,
      createdAt: new Date(),
    })
    .returning();
  return msg;
}

export async function listTeamMessages(teamId: string) {
  const db = getCoreDb();
  return db
    .select({
      id: teamMessages.id,
      content: teamMessages.content,
      createdAt: teamMessages.createdAt,
      userId: teamMessages.userId,
      authorName: profiles.fullName,
      authorUsername: profiles.username,
      authorAvatar: profiles.avatarUrl,
      authorStudentCode: profiles.studentCode,
    })
    .from(teamMessages)
    .innerJoin(profiles, eq(teamMessages.userId, profiles.id))
    .where(eq(teamMessages.teamId, teamId))
    .orderBy(teamMessages.createdAt);
}
