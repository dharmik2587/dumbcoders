import { eq } from 'drizzle-orm';
import { getCoreDb, hasCoreDatabase } from '@/lib/db/core';
import { githubData } from '@/lib/db/schema/core';
import { requireUserId } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }

  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const providerToken = session?.provider_token;

    if (!providerToken) {
      return failure(
        'GITHUB_NOT_CONNECTED',
        'Sign in or link with GitHub to sync your repository profile.',
        409,
      );
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${providerToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'HackMate/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return failure('GITHUB_ERROR', 'GitHub could not be reached.', 502);
    }

    const user = (await response.json()) as {
      login?: string;
      html_url?: string;
      bio?: string | null;
      avatar_url?: string;
      public_repos?: number;
      followers?: number;
      following?: number;
    };

    const reposResponse = await fetch(
      'https://api.github.com/user/repos?per_page=30&sort=updated&direction=desc',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${providerToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'HackMate/1.0',
        },
        cache: 'no-store',
      },
    );

    const repositories = reposResponse.ok
      ? ((await reposResponse.json()) as Array<{ language?: string | null }>)
      : [];

    const languages = repositories.reduce<Record<string, number>>((counts, repo) => {
      if (repo.language) counts[repo.language] = (counts[repo.language] ?? 0) + 1;
      return counts;
    }, {});

    const db = getCoreDb();
    const [saved] = await db
      .insert(githubData)
      .values({
        userId,
        username: user.login ?? null,
        profileUrl: user.html_url ?? null,
        bio: user.bio ?? null,
        avatarUrl: user.avatar_url ?? null,
        publicRepos: user.public_repos ?? 0,
        followers: user.followers ?? 0,
        following: user.following ?? 0,
        languages,
        publicRepositoryCount: repositories.length,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: githubData.userId,
        set: {
          username: user.login ?? null,
          profileUrl: user.html_url ?? null,
          bio: user.bio ?? null,
          avatarUrl: user.avatar_url ?? null,
          publicRepos: user.public_repos ?? 0,
          followers: user.followers ?? 0,
          following: user.following ?? 0,
          languages,
          publicRepositoryCount: repositories.length,
          syncedAt: new Date(),
        },
      })
      .returning();

    return success(saved);
  } catch (error) {
    console.error('POST /api/github/sync failed', error);
    return failure('GITHUB_SYNC_FAILED', 'GitHub synchronization failed.', 500);
  }
}
