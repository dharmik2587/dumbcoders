import type { Profile } from '@/lib/db/schema/core';

export const TEAM_ROLES = ['frontend', 'backend', 'ml', 'design', 'pitch'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export type RosterMember = {
  role: string | null;
  profile: Pick<Profile, 'skills' | 'rolePreference'>;
};

export type TeamGaps = {
  /** Roles that are covered by at least one member. */
  covered: TeamRole[];
  /** Roles with no member assigned. */
  missing: TeamRole[];
  /** How many of the canonical roles are covered. */
  coverage: number;
};

function roleMatches(role: string, member: RosterMember): boolean {
  const r = role.toLowerCase();
  const memberRole = member.role?.toLowerCase();
  if (memberRole) return memberRole === r;
  const pref = member.profile.rolePreference?.toLowerCase();
  if (pref) return pref === r;
  return false;
}

/**
 * Computes which canonical roles a roster covers vs. which are missing.
 * A role is "covered" if any member's assigned role or preferred role matches it.
 */
export function computeTeamGaps(members: RosterMember[]): TeamGaps {
  const covered = TEAM_ROLES.filter((role) => members.some((m) => roleMatches(role, m)));
  const missing = TEAM_ROLES.filter((role) => !covered.includes(role));
  return {
    covered: [...covered],
    missing: [...missing],
    coverage: Math.round((covered.length / TEAM_ROLES.length) * 100),
  };
}
