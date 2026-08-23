import type { GithubData, Profile } from '@/lib/db/schema/core';

export function calculateProfileComplete(
  profile: Partial<Profile>,
  github: GithubData | null = null,
) {
  let score = 0;
  if (profile.fullName) score += 10;
  if (profile.bio) score += 10;
  if (profile.avatarUrl) score += 5;
  if (profile.collegeId) score += 15;
  if (profile.branch) score += 10;
  if (profile.graduationYear) score += 5;
  if ((profile.skills?.length ?? 0) >= 3) score += 15;
  if (profile.rolePreference) score += 10;
  if ((profile.hackathonInterests?.length ?? 0) > 0) score += 5;
  if (profile.linkedinUrl || profile.portfolioUrl) score += 5;
  if (github) score += 10;
  return Math.min(score, 100);
}
