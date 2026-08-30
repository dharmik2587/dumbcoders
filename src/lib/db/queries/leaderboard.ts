import { and, eq } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { colleges, githubData, leetcodeData, profiles, teamMembers, teams } from '@/lib/db/schema/core';
import { computeScore } from '@/lib/leaderboard/score';

export type LeaderboardScope = 'global' | 'college' | 'batch';

export type LeaderboardEntry = {
  id: string;
  fullName: string | null;
  username: string;
  avatarUrl: string | null;
  studentCode: string | null;
  collegeName: string | null;
  graduationYear: number | null;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  githubScore: number;
  leetcodeScore: number;
  participationScore: number;
  resultScore: number;
  composite: number;
};

export async function getLeaderboard(input: {
  viewerId: string;
  scope: LeaderboardScope;
}): Promise<LeaderboardEntry[]> {
  const db = getCoreDb();

  const viewer = await db.select().from(profiles).where(eq(profiles.id, input.viewerId)).limit(1);
  const viewerProfile = viewer[0];

  const conditions = [];
  if (input.scope === 'college' && viewerProfile?.collegeId) {
    conditions.push(eq(profiles.collegeId, viewerProfile.collegeId));
  } else if (input.scope === 'batch' && viewerProfile?.graduationYear) {
    conditions.push(eq(profiles.graduationYear, viewerProfile.graduationYear));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [profileRows, membershipRows] = await Promise.all([
    db
      .select({ profile: profiles, college: colleges, github: githubData, leetcode: leetcodeData })
      .from(profiles)
      .leftJoin(colleges, eq(profiles.collegeId, colleges.id))
      .leftJoin(githubData, eq(profiles.id, githubData.userId))
      .leftJoin(leetcodeData, eq(profiles.id, leetcodeData.userId))
      .where(where),
    db
      .select({
        userId: teamMembers.userId,
        hackathonId: teams.hackathonId,
        result: teams.result,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id)),
  ]);

  // Aggregate participation + results per user in JS (avoids driver-specific SQL aggregates).
  const hackathonsByUser = new Map<string, Set<string>>();
  const resultsByUser = new Map<string, string[]>();
  for (const row of membershipRows) {
    if (row.hackathonId) {
      const set = hackathonsByUser.get(row.userId) ?? new Set<string>();
      set.add(row.hackathonId);
      hackathonsByUser.set(row.userId, set);
    }
    if (row.result) {
      const list = resultsByUser.get(row.userId) ?? [];
      list.push(row.result);
      resultsByUser.set(row.userId, list);
    }
  }

  return profileRows
    .map((row): LeaderboardEntry => {
      const breakdown = computeScore({
        github: row.github,
        leetcode: row.leetcode,
        distinctHackathons: hackathonsByUser.get(row.profile.id)?.size ?? 0,
        results: resultsByUser.get(row.profile.id) ?? [],
      });
      return {
        id: row.profile.id,
        fullName: row.profile.fullName,
        username: row.profile.username,
        avatarUrl: row.profile.avatarUrl,
        studentCode: row.profile.studentCode,
        collegeName: row.college?.name ?? null,
        graduationYear: row.profile.graduationYear,
        githubUsername: row.profile.githubUsername,
        leetcodeUsername: row.profile.leetcodeUsername,
        ...breakdown,
      };
    })
    .sort((a, b) => b.composite - a.composite);
}
