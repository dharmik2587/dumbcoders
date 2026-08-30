import { and, desc, eq, or } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { conversations, directMessages, profiles } from '@/lib/db/schema/core';

/** Canonicalise a pair so (a, b) and (b, a) map to the same conversation row. */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function findOrCreateConversation(userA: string, userB: string) {
  if (userA === userB) throw new Error('Cannot message yourself');
  const db = getCoreDb();
  const [userAId, userBId] = orderedPair(userA, userB);

  const existing = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userAId, userAId), eq(conversations.userBId, userBId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(conversations)
    .values({ userAId, userBId, updatedAt: new Date() })
    .returning();
  if (!created) throw new Error('Could not create conversation');
  return created;
}

export async function getConversationById(id: string, userId: string) {
  const db = getCoreDb();
  const rows = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, id), or(eq(conversations.userAId, userId), eq(conversations.userBId, userId))))
    .limit(1);
  return rows[0] ?? null;
}

export async function listMyConversations(userId: string) {
  const db = getCoreDb();
  return db
    .select({
      conversation: conversations,
      other: profiles,
    })
    .from(conversations)
    .innerJoin(
      profiles,
      or(
        and(eq(conversations.userAId, userId), eq(profiles.id, conversations.userBId)),
        and(eq(conversations.userBId, userId), eq(profiles.id, conversations.userAId)),
      ),
    )
    .orderBy(desc(conversations.updatedAt));
}

export async function listDirectMessages(conversationId: string) {
  const db = getCoreDb();
  return db
    .select({
      id: directMessages.id,
      content: directMessages.content,
      createdAt: directMessages.createdAt,
      senderId: directMessages.senderId,
      readAt: directMessages.readAt,
      authorName: profiles.fullName,
      authorUsername: profiles.username,
      authorAvatar: profiles.avatarUrl,
    })
    .from(directMessages)
    .innerJoin(profiles, eq(directMessages.senderId, profiles.id))
    .where(eq(directMessages.conversationId, conversationId))
    .orderBy(directMessages.createdAt);
}

export async function createDirectMessage(conversationId: string, senderId: string, content: string) {
  const db = getCoreDb();
  const [msg] = await db
    .insert(directMessages)
    .values({ conversationId, senderId, content, createdAt: new Date() })
    .returning();
  if (!msg) throw new Error('Could not send message');
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));
  return msg;
}
