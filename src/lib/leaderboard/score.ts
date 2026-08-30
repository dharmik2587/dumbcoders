import type { GithubData, LeetcodeData } from '@/lib/db/schema/core';

/**
 * Leaderboard scoring model.
 *
 * Composite (0–100) = GitHub (25) + LeetCode (25) + Participation (25) + Results (25).
 * Each component is capped so a single strong signal cannot dominate, and raw counts are
 * log-scaled where appropriate to reduce "farming" incentives.
 *
 * Users can link EITHER or BOTH platforms — missing platforms score 0 for that component,
 * so the composite naturally reflects whichever platforms they've linked.
 */

export const MAX_GITHUB = 25;
export const MAX_LEETCODE = 25;
export const MAX_PARTICIPATION = 25;
export const MAX_RESULT = 25;

/** Points per distinct hackathon the user has entered (as a team member). */
export const PARTICIPATION_POINTS = 3;

/** Points awarded per team result (a user accumulates across every team they were part of). */
export const RESULT_POINTS: Record<string, number> = {
  won: 25,
  second: 18,
  third: 12,
  finalist: 8,
  participated: 4,
};

export type ScoreBreakdown = {
  githubScore: number;
  leetcodeScore: number;
  participationScore: number;
  resultScore: number;
  composite: number;
};

export function githubScore(github: Pick<GithubData, 'publicRepos' | 'followers' | 'languages'> | null | undefined): number {
  if (!github) return 0;
  const repos = Math.max(0, github.publicRepos ?? 0);
  const followers = Math.max(0, github.followers ?? 0);
  const languages = Object.keys(github.languages ?? {}).length;
  const raw =
    4 * Math.log10(1 + repos) +
    3 * Math.log10(1 + followers) +
    2.5 * Math.log10(1 + languages);
  return Math.min(MAX_GITHUB, Math.round(raw * 10) / 10);
}

/**
 * LeetCode score: weights Easy (×1), Medium (×2), Hard (×4) then log-scales.
 * Contest rating adds a bonus if the user has attended contests.
 */
export function leetcodeScore(
  leetcode: Pick<LeetcodeData, 'easySolved' | 'mediumSolved' | 'hardSolved' | 'contestRating' | 'contestsAttended'> | null | undefined,
): number {
  if (!leetcode) return 0;
  const weighted =
    (leetcode.easySolved ?? 0) * 1 +
    (leetcode.mediumSolved ?? 0) * 2 +
    (leetcode.hardSolved ?? 0) * 4;
  // Log-scale the weighted count to dampen farming
  const solveRaw = 5 * Math.log10(1 + weighted);
  // Contest bonus: up to 5 points for having a contest rating
  const contestBonus =
    (leetcode.contestRating ?? 0) > 0
      ? Math.min(5, 2 * Math.log10(1 + (leetcode.contestRating ?? 0)) + 0.5 * Math.log10(1 + (leetcode.contestsAttended ?? 0)))
      : 0;
  const raw = solveRaw + contestBonus;
  return Math.min(MAX_LEETCODE, Math.round(raw * 10) / 10);
}

export function participationScore(distinctHackathons: number): number {
  const raw = Math.max(0, distinctHackathons) * PARTICIPATION_POINTS;
  return Math.min(MAX_PARTICIPATION, Math.round(raw * 10) / 10);
}

export function resultScore(results: string[]): number {
  const raw = results.reduce((sum, r) => sum + (RESULT_POINTS[r] ?? 0), 0);
  return Math.min(MAX_RESULT, raw);
}

export function computeScore(input: {
  github: Pick<GithubData, 'publicRepos' | 'followers' | 'languages'> | null | undefined;
  leetcode: Pick<LeetcodeData, 'easySolved' | 'mediumSolved' | 'hardSolved' | 'contestRating' | 'contestsAttended'> | null | undefined;
  distinctHackathons: number;
  results: string[];
}): ScoreBreakdown {
  const g = githubScore(input.github);
  const l = leetcodeScore(input.leetcode);
  const p = participationScore(input.distinctHackathons);
  const r = resultScore(input.results);
  const composite = Math.round((g + l + p + r) * 10) / 10;
  return { githubScore: g, leetcodeScore: l, participationScore: p, resultScore: r, composite };
}
