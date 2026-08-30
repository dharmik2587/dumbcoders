import { and, asc, count, desc, eq, ilike, sql } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { hackathonBookmarks, hackathonInterests, hackathons, hackathonSources } from '@/lib/db/schema/core';
import type { HackathonIngestItem } from '@/lib/validations/hackathon';

function dateOrNull(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function hackathonValues(item: HackathonIngestItem, canonicalKey: string) {
  return {
    canonicalKey,
    title: item.title,
    description: item.description ?? null,
    organizer: item.organizer ?? null,
    startAt: dateOrNull(item.startAt),
    endAt: dateOrNull(item.endAt),
    registrationDeadlineAt: dateOrNull(item.registrationDeadlineAt),
    timezone: item.timezone,
    mode: item.mode ?? null,
    location: item.location ?? null,
    teamSizeMin: item.teamSizeMin ?? null,
    teamSizeMax: item.teamSizeMax ?? null,
    prizeAmount: item.prizeAmount ?? null,
    prizeCurrency: item.prizeCurrency,
    prizeDisplay: item.prizeDisplay ?? null,
    themes: item.themes,
    techStack: item.techStack,
    registrationUrl: item.registrationUrl ?? null,
    sourceUrl: item.sourceUrl ?? null,
    status: 'published',
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };
}

export async function upsertHackathonSource(item: HackathonIngestItem) {
  const db = getCoreDb();
  const existingSource = await db
    .select({ source: hackathonSources })
    .from(hackathonSources)
    .where(and(eq(hackathonSources.source, item.source), eq(hackathonSources.sourceId, item.sourceId)))
    .limit(1);

  if (existingSource[0]) {
    const hackathonId = existingSource[0].source.hackathonId;
    await db.update(hackathons).set(hackathonValues(item, (await getHackathonById(hackathonId))?.canonicalKey ?? `${item.source}:${item.sourceId}`)).where(eq(hackathons.id, hackathonId));
    const [updatedSource] = await db
      .update(hackathonSources)
      .set({
        sourceUrl: item.sourceUrl ?? null,
        registrationUrl: item.registrationUrl ?? null,
        rawPayload: item.rawPayload,
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(hackathonSources.id, existingSource[0].source.id))
      .returning();
    return { action: 'updated' as const, hackathonId, source: updatedSource };
  }

  const canonicalKey = item.canonicalKey ?? `${item.source}:${item.sourceId}`;
  const [createdHackathon] = await db.insert(hackathons).values(hackathonValues(item, canonicalKey)).returning();
  if (!createdHackathon) throw new Error('Hackathon insert did not return a record');

  const [createdSource] = await db
    .insert(hackathonSources)
    .values({
      hackathonId: createdHackathon.id,
      source: item.source,
      sourceId: item.sourceId,
      sourceUrl: item.sourceUrl ?? null,
      registrationUrl: item.registrationUrl ?? null,
      rawPayload: item.rawPayload,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return { action: 'created' as const, hackathonId: createdHackathon.id, source: createdSource };
}

export async function getHackathonById(id: string) {
  const db = getCoreDb();
  const rows = await db.select().from(hackathons).where(eq(hackathons.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function closeExpiredHackathons(): Promise<number> {
  const db = getCoreDb();
  const res = await db
    .update(hackathons)
    .set({ status: 'closed', updatedAt: new Date() })
    .where(and(sql`${hackathons.registrationDeadlineAt} < NOW()`, sql`${hackathons.status} != 'closed'`))
    .returning({ id: hackathons.id });
  return res.length;
}

export async function listHackathons(filters: {
  q?: string;
  source?: string;
  mode?: string;
  theme?: string;
  status?: string;
  page: number;
  pageSize: number;
}) {
  const db = getCoreDb();
  
  // Auto-close any past hackathons on query
  try {
    await closeExpiredHackathons();
  } catch (err) {
    console.error('Failed auto-closing expired hackathons:', err);
  }

  const conditions = [];
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(hackathons.status, filters.status));
  } else if (!filters.status) {
    // Default to published active hackathons only
    conditions.push(eq(hackathons.status, 'published'));
    conditions.push(sql`(${hackathons.registrationDeadlineAt} >= NOW() OR ${hackathons.registrationDeadlineAt} IS NULL)`);
  }

  if (filters.source) conditions.push(sql`exists (select 1 from ${hackathonSources} hs where hs.hackathon_id = ${hackathons.id} and hs.source = ${filters.source})`);
  if (filters.mode) conditions.push(eq(hackathons.mode, filters.mode));
  if (filters.theme) conditions.push(sql`${hackathons.themes} @> ARRAY[${filters.theme}]::text[]`);
  if (filters.q) conditions.push(ilike(hackathons.title, `%${filters.q}%`));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * filters.pageSize;
  const [rows, totalRows] = await Promise.all([
    db.select().from(hackathons).where(where).orderBy(asc(hackathons.registrationDeadlineAt), desc(hackathons.createdAt)).limit(filters.pageSize).offset(offset),
    db.select({ total: count() }).from(hackathons).where(where),
  ]);

  return {
    rows,
    total: Number(totalRows[0]?.total ?? 0),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getUserHackathonFlags(userId: string, hackathonId: string) {
  const db = getCoreDb();
  const [bookmark, interest] = await Promise.all([
    db.select({ id: hackathonBookmarks.id }).from(hackathonBookmarks).where(and(eq(hackathonBookmarks.userId, userId), eq(hackathonBookmarks.hackathonId, hackathonId))).limit(1),
    db.select({ id: hackathonInterests.id }).from(hackathonInterests).where(and(eq(hackathonInterests.userId, userId), eq(hackathonInterests.hackathonId, hackathonId))).limit(1),
  ]);
  return { bookmarked: Boolean(bookmark[0]), interested: Boolean(interest[0]) };
}
