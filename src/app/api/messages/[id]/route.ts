import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import {
  createDirectMessage,
  getConversationById,
  listDirectMessages,
} from '@/lib/db/queries/messages';
import { createNotification } from '@/lib/db/queries/notifications';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';

const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const conversationId = (await params).id;
  const conversation = await getConversationById(conversationId, userId);
  if (!conversation) return failure('FORBIDDEN', 'Conversation not found.', 404);

  try {
    return success(await listDirectMessages(conversationId));
  } catch (error) {
    console.error('GET /api/messages/[id] failed', error);
    return failure('DATABASE_ERROR', 'Could not load messages.', 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const conversationId = (await params).id;
  const conversation = await getConversationById(conversationId, userId);
  if (!conversation) return failure('FORBIDDEN', 'Conversation not found.', 404);

  const parsed = sendMessageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return failure('VALIDATION_ERROR', 'Message content is required.', 400);

  try {
    const message = await createDirectMessage(conversationId, userId, parsed.data.content);

    const otherUserId =
      conversation.userAId === userId ? conversation.userBId : conversation.userAId;
    await createNotification({
      userId: otherUserId,
      type: 'direct_message',
      title: 'New message',
      message: parsed.data.content.length > 80 ? `${parsed.data.content.slice(0, 80)}…` : parsed.data.content,
      href: `/messages?to=${userId}`,
    });

    return success(message, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages/[id] failed', error);
    return failure('DATABASE_ERROR', 'Could not send message.', 500);
  }
}
