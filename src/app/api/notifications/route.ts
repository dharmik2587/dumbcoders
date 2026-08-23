import { requireUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { listNotifications } from '@/lib/db/queries/notifications';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  let userId: string;
  try { userId = await requireUserId(); } catch { return failure('UNAUTHORIZED', 'Sign in to continue.', 401); }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);
  return success(await listNotifications(userId));
}
