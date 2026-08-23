import { eq } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { notifications, outboxEvents } from '@/lib/db/schema/core';

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  href?: string;
  dedupeKey?: string;
}) {
  const db = getCoreDb();
  const [notification] = await db
    .insert(notifications)
    .values({ ...input, href: input.href ?? null, dedupeKey: input.dedupeKey ?? null })
    .onConflictDoNothing({ target: notifications.dedupeKey })
    .returning();
  return notification ?? null;
}

export async function createOutboxEvent(input: {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}) {
  const db = getCoreDb();
  const [event] = await db.insert(outboxEvents).values(input).returning();
  return event ?? null;
}

export async function listNotifications(userId: string) {
  const db = getCoreDb();
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(notifications.createdAt);
}
