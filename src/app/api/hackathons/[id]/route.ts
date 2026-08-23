import { NextRequest } from 'next/server';
import { getOptionalUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { getHackathonById, getUserHackathonFlags } from '@/lib/db/queries/hackathons';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);
  const { id } = await params;

  try {
    const hackathon = await getHackathonById(id);
    if (!hackathon) return failure('NOT_FOUND', 'Hackathon not found.', 404);
    const userId = await getOptionalUserId();
    const flags = userId ? await getUserHackathonFlags(userId, id) : { bookmarked: false, interested: false };
    return success({ hackathon, ...flags });
  } catch (error) {
    console.error('GET /api/hackathons/[id] failed', error);
    return failure('DATABASE_ERROR', 'Could not load the hackathon.', 500);
  }
}
