import { NextRequest } from 'next/server';
import { requireUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { getLeaderboard, type LeaderboardScope } from '@/lib/db/queries/leaderboard';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

const SCOPES: LeaderboardScope[] = ['global', 'college', 'batch'];

export async function GET(request: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const scopeParam = request.nextUrl.searchParams.get('scope') ?? 'global';
  const scope: LeaderboardScope = SCOPES.includes(scopeParam as LeaderboardScope)
    ? (scopeParam as LeaderboardScope)
    : 'global';

  try {
    const entries = await getLeaderboard({ viewerId: userId, scope });
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('pageSize') ?? 50)));
    const start = (page - 1) * pageSize;
    const pageRows = entries.slice(start, start + pageSize);

    return success({
      data: pageRows.map((entry, i) => ({ rank: start + i + 1, userId: entry.id, ...entry })),
      meta: { total: entries.length, page, pageSize, hasMore: start + pageSize < entries.length },
      viewerRank: entries.findIndex((e) => e.id === userId) + 1,
    });
  } catch (error) {
    console.error('GET /api/leaderboard failed', error);
    return failure('DATABASE_ERROR', 'Could not load the leaderboard.', 500);
  }
}
