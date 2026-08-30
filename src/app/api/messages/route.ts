import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireUserId } from '@/lib/auth/server';
import { getCoreDb, hasCoreDatabase } from '@/lib/db/core';
import { profiles } from '@/lib/db/schema/core';
import { findOrCreateConversation, listMyConversations } from '@/lib/db/queries/messages';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

const openConversationSchema = z.object({
  toUserId: z.string().min(1),
});

export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  try {
    const conversations = await listMyConversations(userId);
    return success(
      conversations.map(({ conversation, other }) => ({
        conversationId: conversation.id,
        other: {
          id: other.id,
          fullName: other.fullName,
          username: other.username,
          avatarUrl: other.avatarUrl,
          studentCode: other.studentCode,
        },
      })),
    );
  } catch (error) {
    console.error('GET /api/messages failed', error);
    return failure('DATABASE_ERROR', 'Could not load conversations.', 500);
  }
}

export async function POST(request: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const parsed = openConversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure('VALIDATION_ERROR', 'A recipient is required.', 400);
  if (parsed.data.toUserId === userId) return failure('INVALID_RECIPIENT', 'You cannot message yourself.', 400);

  const db = getCoreDb();
  const recipient = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, parsed.data.toUserId))
    .limit(1);
  if (!recipient[0]) return failure('NOT_FOUND', 'Recipient not found.', 404);

  try {
    const conversation = await findOrCreateConversation(userId, parsed.data.toUserId);
    return success({ conversationId: conversation.id });
  } catch (error) {
    console.error('POST /api/messages failed', error);
    return failure('CREATE_FAILED', 'Could not start the conversation.', 500);
  }
}
