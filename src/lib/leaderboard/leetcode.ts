/**
 * LeetCode public GraphQL API client.
 *
 * Fetches user stats from `https://leetcode.com/graphql` — no API key needed.
 * We query the `matchedUser` and `userContestRanking` fields to get solve
 * counts, global ranking, and contest rating.
 */

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

export type LeetcodeStats = {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  contestRating: number | null;
  contestsAttended: number;
};

const USER_STATS_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    userContestRanking(username: $username) {
      rating
      attendedContestsCount
    }
  }
`;

/**
 * Fetch a LeetCode user's stats by username.
 * Returns null if the user does not exist.
 * Throws on network / API errors.
 */
export async function fetchLeetcodeStats(username: string): Promise<LeetcodeStats | null> {
  const response = await fetch(LEETCODE_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
      'User-Agent': 'HackMate/1.0',
    },
    body: JSON.stringify({
      query: USER_STATS_QUERY,
      variables: { username },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`LeetCode API returned ${response.status}`);
  }

  const json = await response.json();

  // User not found
  if (!json.data?.matchedUser) {
    return null;
  }

  const user = json.data.matchedUser;
  const submissions: Array<{ difficulty: string; count: number }> =
    user.submitStatsGlobal?.acSubmissionNum ?? [];

  const bySeverity = (d: string) => submissions.find((s) => s.difficulty === d)?.count ?? 0;

  const contestRanking = json.data.userContestRanking;

  return {
    username: user.username ?? username,
    totalSolved: bySeverity('All'),
    easySolved: bySeverity('Easy'),
    mediumSolved: bySeverity('Medium'),
    hardSolved: bySeverity('Hard'),
    ranking: user.profile?.ranking ?? null,
    contestRating: contestRanking?.rating ? Math.round(contestRanking.rating) : null,
    contestsAttended: contestRanking?.attendedContestsCount ?? 0,
  };
}
