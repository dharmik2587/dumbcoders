/**
 * GitHub public REST API client for unauthenticated lookups.
 *
 * Fetches user profile + top repos from `https://api.github.com/users/{username}`.
 * No token needed for public data (60 requests/hour rate limit).
 */

export type GithubPublicStats = {
  username: string;
  profileUrl: string;
  bio: string | null;
  avatarUrl: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  languages: Record<string, number>;
};

/**
 * Fetch a GitHub user's public stats by username.
 * Returns null if the user does not exist (404).
 * Throws on network / API errors.
 */
export async function fetchGithubPublicStats(username: string): Promise<GithubPublicStats | null> {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'HackMate/1.0',
  };

  // 1. Fetch user profile
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers,
    cache: 'no-store',
  });

  if (userRes.status === 404) return null;
  if (!userRes.ok) throw new Error(`GitHub API returned ${userRes.status}`);

  const user = (await userRes.json()) as {
    login: string;
    html_url: string;
    bio: string | null;
    avatar_url: string | null;
    public_repos: number;
    followers: number;
    following: number;
  };

  // 2. Fetch repos for language stats
  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30&sort=updated&direction=desc`,
    { headers, cache: 'no-store' },
  );

  const repos = reposRes.ok
    ? ((await reposRes.json()) as Array<{ language?: string | null }>)
    : [];

  const languages = repos.reduce<Record<string, number>>((counts, repo) => {
    if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
    return counts;
  }, {});

  return {
    username: user.login,
    profileUrl: user.html_url,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    publicRepos: user.public_repos ?? 0,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    languages,
  };
}
