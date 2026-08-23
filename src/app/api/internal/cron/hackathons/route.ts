import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { hasCoreDatabase, getCoreDb } from '@/lib/db/core';
import { ingestionRuns } from '@/lib/db/schema/core';
import { upsertHackathonSource } from '@/lib/db/queries/hackathons';
import { hackathonIngestItemSchema } from '@/lib/validations/hackathon';
import { failure, success } from '@/lib/http';

export const runtime = 'nodejs';
export const maxDuration = 120; // Allow up to 2 minutes for scraping

const UNSTOP_API = 'https://unstop.com/api/public/opportunity/search-result';
const UNSTOP_BASE = 'https://unstop.com';

const DEFAULT_SECRET = '6f1937335954a1a0bbd7685ffea7c8189ca4a26f08a7eeaec671b3ad7d9ab895';

function authenticate(request: NextRequest) {
  const secret = process.env.N8N_INGEST_SECRET || process.env.CRON_SECRET || DEFAULT_SECRET;
  
  // Check authorization header
  const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  // Check query parameter (?secret=... or ?key=...)
  const querySecret = request.nextUrl.searchParams.get('secret') || request.nextUrl.searchParams.get('key') || '';

  const provided = authHeader || querySecret;

  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}


function cleanCurrencyAmount(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^\d.]/g, '');
  if (!cleaned) return null;
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val.toFixed(2);
}

function parseDateToIso(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const dt = new Date(String(dateStr));
    if (!isNaN(dt.getTime())) return dt.toISOString();
  } catch { /* ignore */ }

  const daysMatch = String(dateStr).toLowerCase().match(/(\d+)\s*days?\s*left/);
  if (daysMatch) {
    const future = new Date(Date.now() + parseInt(daysMatch[1]) * 86400000);
    return future.toISOString();
  }
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface UnstopItem {
  id?: string | number;
  slug?: string;
  short_id?: string;
  title?: string;
  name?: string;
  seo_url?: string;
  public_url?: string;
  organisation?: { name?: string } | string;
  author?: string;
  details?: string;
  description?: string;
  short_description?: string;
  regnRequirements?: {
    end_regn_dt?: string;
    min_team_size?: number;
    max_team_size?: number;
  };
  end_date?: string;
  registration_end_date?: string;
  approved_date?: string;
  start_date?: string;
  updated_at?: string;
  prizes?: Array<{ title?: string; prize_amount?: string; amount?: string | number }>;
  prizes_total?: string | number;
  prize_money?: string | number;
  region?: string;
  type?: string;
  tags?: Array<{ name?: string } | string>;
  required_skills?: Array<{ name?: string } | string>;
  [key: string]: unknown;
}
type NormalizedHackathon = NonNullable<ReturnType<typeof normalizeItem>>;

async function fetchUnstopHackathons(limit: number = 100): Promise<NormalizedHackathon[]> {
  const hackathons: NormalizedHackathon[] = [];
  let page = 1;

  while (hackathons.length < limit && page <= 7) {
    try {
      const perPage = Math.min(30, limit - hackathons.length);
      const url = `${UNSTOP_API}?opportunity=hackathons&per_page=${perPage}&page=${page}&oppstatus=open`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://unstop.com/hackathons',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) break;

      const data = await res.json();
      const dataObj = data?.data;
      const items: UnstopItem[] = Array.isArray(dataObj?.data)
        ? dataObj.data
        : Array.isArray(dataObj)
          ? dataObj
          : [];

      if (!items.length) break;

      for (const item of items) {
        const normalized = normalizeItem(item);
        if (normalized) hackathons.push(normalized);
        if (hackathons.length >= limit) break;
      }

      page++;
      // Small delay between pages to be polite
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`Unstop API page ${page} error:`, err);
      break;
    }
  }

  return hackathons;
}

function normalizeItem(item: UnstopItem) {
  const sourceId = String(item.id || item.slug || item.short_id || '');
  if (!sourceId) return null;

  const title = String(item.title || item.name || 'Unstop Hackathon');
  const slug = item.seo_url || item.public_url || item.slug || '';

  let registrationUrl: string;
  if (String(slug).startsWith('http')) {
    registrationUrl = String(slug);
  } else if (slug) {
    registrationUrl = `${UNSTOP_BASE}/${String(slug).replace(/^\//, '')}`;
  } else {
    registrationUrl = `${UNSTOP_BASE}/hackathons/${sourceId}`;
  }

  let organizer: string;
  if (typeof item.organisation === 'object' && item.organisation?.name) {
    organizer = item.organisation.name;
  } else if (typeof item.organisation === 'string') {
    organizer = item.organisation;
  } else {
    organizer = (item.author as string) || 'Unstop Organizer';
  }

  const rawDesc = item.details || item.description || item.short_description
    || `Join ${title} on Unstop. Showcase your skills, build projects, and compete for prizes.`;
  const description = rawDesc.includes('<') ? stripHtml(rawDesc) : String(rawDesc).trim();

  // Dates
  const regReq = item.regnRequirements || {};
  const regEnd = regReq.end_regn_dt || item.end_date || item.registration_end_date;
  const startDt = item.approved_date || item.start_date || item.updated_at;
  const endDt = item.end_date;

  // Prizes
  let prizeDisplay: string | null = null;
  let prizeAmount: string | null = null;
  const prizes = item.prizes;
  if (Array.isArray(prizes) && prizes.length) {
    const first = prizes[0];
    if (typeof first === 'object') {
      prizeDisplay = first.title || first.prize_amount || null;
      prizeAmount = cleanCurrencyAmount(String(first.amount || prizeDisplay));
    }
  } else if (item.prizes_total || item.prize_money) {
    prizeDisplay = String(item.prizes_total || item.prize_money);
    prizeAmount = cleanCurrencyAmount(prizeDisplay);
  }

  // Mode
  const regionStr = String(item.region || item.type || 'Online').toLowerCase();
  const mode = regionStr.includes('online') ? 'Online'
    : regionStr.includes('offline') ? 'In-Person'
    : regionStr.includes('hybrid') ? 'Hybrid' : 'Online';

  // Teams
  const teamMin = regReq.min_team_size ?? 1;
  const teamMax = regReq.max_team_size ?? 4;

  // Themes & tech stack
  const themes: string[] = [];
  if (Array.isArray(item.tags)) {
    for (const t of item.tags) {
      const name = typeof t === 'object' ? t?.name : String(t);
      if (name && name.length <= 50) themes.push(name);
    }
  }

  const techStack: string[] = [];
  if (Array.isArray(item.required_skills)) {
    for (const s of item.required_skills) {
      const name = typeof s === 'object' ? s?.name : String(s);
      if (name && name.length <= 50) techStack.push(name);
    }
  }

  if (!themes.length) themes.push('AI/ML', 'Web Development', 'Innovation');
  if (!techStack.length) techStack.push('React', 'Node.js', 'Python', 'Full Stack');

  return {
    source: 'unstop' as const,
    sourceId,
    canonicalKey: `unstop:${sourceId}`,
    title: title.slice(0, 200),
    description: description.slice(0, 10000),
    organizer: String(organizer).slice(0, 200),
    startAt: parseDateToIso(startDt),
    endAt: parseDateToIso(endDt),
    registrationDeadlineAt: parseDateToIso(regEnd),
    timezone: 'UTC',
    mode,
    location: mode === 'Online' ? 'Online' : 'India',
    teamSizeMin: teamMin,
    teamSizeMax: teamMax,
    prizeAmount,
    prizeCurrency: 'INR',
    prizeDisplay: prizeDisplay?.slice(0, 200) || (prizeAmount ? `₹${prizeAmount}` : 'Cash & Certificates'),
    themes: themes.slice(0, 10),
    techStack: techStack.slice(0, 8),
    registrationUrl,
    sourceUrl: registrationUrl,
    rawPayload: { source_provider: 'unstop_api_cron', id: sourceId },
  };
}

export async function POST(request: NextRequest) {
  if (!authenticate(request)) {
    return failure('UNAUTHORIZED', 'Invalid cron credentials.', 401);
  }
  if (!hasCoreDatabase()) {
    return failure('NOT_CONFIGURED', 'Database is not configured.', 503);
  }

  console.log('[Cron] Starting hackathon refresh from Unstop API...');

  const hackathons = await fetchUnstopHackathons(100);
  console.log(`[Cron] Fetched ${hackathons.length} hackathons from Unstop`);

  if (!hackathons.length) {
    return success({ message: 'No hackathons found from Unstop', inserted: 0, updated: 0, rejected: 0 });
  }

  // Create ingestion run
  const db = getCoreDb();
  const runId = `cron-${Date.now()}`;
  const [run] = await db.insert(ingestionRuns).values({
    externalRunId: runId,
    source: 'unstop',
    status: 'running',
    totalReceived: hackathons.length,
  }).returning();

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const item of hackathons) {
    const parsed = hackathonIngestItemSchema.safeParse(item);
    if (!parsed.success) {
      errors.push(`unstop:${item.sourceId} — validation: ${parsed.error.message}`);
      continue;
    }
    try {
      const result = await upsertHackathonSource(parsed.data);
      if (result.action === 'created') created++;
      else updated++;
    } catch (err) {
      errors.push(`unstop:${item.sourceId} — ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  const rejected = errors.length;
  if (run) {
    await db.update(ingestionRuns).set({
      status: rejected === hackathons.length ? 'failed' : rejected ? 'partial' : 'completed',
      totalReceived: hackathons.length,
      createdCount: created,
      updatedCount: updated,
      rejectedCount: rejected,
      errors,
      finishedAt: new Date(),
    }).where(eq(ingestionRuns.id, run.id));
  }

  console.log(`[Cron] Hackathon refresh done. Created: ${created}, Updated: ${updated}, Rejected: ${rejected}`);

  return success({
    message: `Processed ${hackathons.length} hackathons`,
    inserted: created,
    updated,
    rejected,
    errors: errors.slice(0, 10),
  });
}

// Also support GET for easy manual trigger / health check
export async function GET(request: NextRequest) {
  return POST(request);
}
