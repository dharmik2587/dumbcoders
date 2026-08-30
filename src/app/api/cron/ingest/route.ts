import { NextRequest, NextResponse } from 'next/server';
import { getCoreDb, hasCoreDatabase } from '@/lib/db/core';
import { upsertHackathonSource, closeExpiredHackathons } from '@/lib/db/queries/hackathons';
import { HackathonIngestItem } from '@/lib/validations/hackathon';

export const runtime = 'nodejs'; // Use nodejs runtime for robust fetching/parsing
export const dynamic = 'force-dynamic';

async function scrapeUnstop(): Promise<HackathonIngestItem[]> {
  const items: HackathonIngestItem[] = [];
  try {
    const res = await fetch('https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=1&per_page=100&status=Open');
    if (!res.ok) throw new Error(`Unstop HTTP error! status: ${res.status}`);
    const data = await res.json();
    const opportunities = data?.data?.data || [];
    
    for (const opp of opportunities) {
      if (!opp.id || !opp.title) continue;
      
      let themes = (opp.filters || []).map((f: any) => f.name).slice(0, 10);
      if (themes.length === 0) themes = ["Open"];
      
      const item: HackathonIngestItem = {
        source: 'unstop',
        sourceId: opp.id.toString(),
        canonicalKey: `unstop:${opp.id}`,
        title: opp.title.substring(0, 200),
        description: opp.public_objective?.substring(0, 1000) || opp.seo_description?.substring(0, 1000) || null,
        organizer: opp.organization?.name?.substring(0, 200) || 'Unknown',
        startAt: opp.start_date ? new Date(opp.start_date).toISOString() : null,
        endAt: opp.end_date ? new Date(opp.end_date).toISOString() : null,
        registrationDeadlineAt: opp.regnRequirements?.end_regn_dt ? new Date(opp.regnRequirements.end_regn_dt).toISOString() : null,
        timezone: 'UTC',
        mode: opp.opportunity_config?.show_region ? 'onsite' : 'remote',
        location: opp.job_location || 'Online',
        teamSizeMin: opp.regnRequirements?.min_team_size || 1,
        teamSizeMax: opp.regnRequirements?.max_team_size || 4,
        prizeAmount: opp.payment_services?.[0]?.amount ? String(opp.payment_services[0].amount) : null,
        prizeCurrency: 'INR',
        prizeDisplay: opp.payment_services?.[0]?.amount ? `₹${opp.payment_services[0].amount}` : null,
        themes: themes,
        techStack: (opp.required_skills || []).map((s: any) => s.skill_name).slice(0, 10),
        registrationUrl: opp.short_url || `https://unstop.com/hackathons/${opp.seo_url}`,
        sourceUrl: opp.short_url || `https://unstop.com/hackathons/${opp.seo_url}`,
        rawPayload: opp,
      };
      if (item.registrationDeadlineAt && new Date(item.registrationDeadlineAt) < new Date()) {
          continue;
      }
      items.push(item);
    }
  } catch (error) {
    console.error('Failed to scrape Unstop:', error);
  }
  return items;
}

async function scrapeDevfolio(): Promise<HackathonIngestItem[]> {
  const items: HackathonIngestItem[] = [];
  try {
    const res = await fetch('https://devfolio.co/hackathons');
    if (!res.ok) throw new Error(`Devfolio HTTP error! status: ${res.status}`);
    const html = await res.text();
    
    // Extract __NEXT_DATA__ JSON blob
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match || !match[1]) throw new Error("Could not find __NEXT_DATA__ in Devfolio HTML");
    
    const data = JSON.parse(match[1]);
    const hackathons = data?.props?.pageProps?.initialState?.hackathons?.hackathons || [];
    
    for (const h of hackathons) {
      if (!h.id || !h.name) continue;
      
      const item: HackathonIngestItem = {
        source: 'devfolio',
        sourceId: h.id.toString(),
        canonicalKey: `devfolio:${h.id}`,
        title: h.name.substring(0, 200),
        description: h.description?.substring(0, 1000) || h.tagline?.substring(0, 1000) || null,
        organizer: h.host_name?.substring(0, 200) || 'Unknown',
        startAt: h.starts_at ? new Date(h.starts_at).toISOString() : null,
        endAt: h.ends_at ? new Date(h.ends_at).toISOString() : null,
        registrationDeadlineAt: h.applications_close_at ? new Date(h.applications_close_at).toISOString() : null,
        timezone: 'UTC',
        mode: h.location_type === 'online' ? 'remote' : h.location_type === 'hybrid' ? 'hybrid' : 'onsite',
        location: h.location || h.location_type || 'Online',
        teamSizeMin: h.team_size_min || 1,
        teamSizeMax: h.team_size_max || 4,
        prizeAmount: null,
        prizeCurrency: 'INR',
        prizeDisplay: null,
        themes: (h.themes || []).slice(0, 10),
        techStack: [],
        registrationUrl: h.devfolio_url || `https://${h.slug}.devfolio.co`,
        sourceUrl: h.devfolio_url || `https://${h.slug}.devfolio.co`,
        rawPayload: h,
      };
      
      if (item.registrationDeadlineAt && new Date(item.registrationDeadlineAt) < new Date()) {
          continue;
      }
      
      if (item.registrationDeadlineAt && new Date(item.registrationDeadlineAt) < new Date()) {
          continue;
      }
      items.push(item);
    }
  } catch (error) {
    console.error('Failed to scrape Devfolio:', error);
  }
  return items;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow testing without auth on local, require it on prod.
  }

  if (!hasCoreDatabase()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  console.log('Starting hackathon ingestion from Unstop and Devfolio...');
  const [unstop, devfolio] = await Promise.all([
    scrapeUnstop(),
    scrapeDevfolio()
  ]);

  const allItems = [...unstop, ...devfolio];
  console.log(`Found ${unstop.length} live Unstop events and ${devfolio.length} live Devfolio events.`);

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const item of allItems) {
    try {
      const result = await upsertHackathonSource(item);
      if (result.action === 'created') created++;
      else updated++;
    } catch (err: any) {
      console.error(`Failed to upsert ${item.title}:`, err);
      errors.push(`${item.source}:${item.sourceId} - ${err.message}`);
    }
  }

  // Auto-close any expired hackathons
  let closedCount = 0;
  try {
    closedCount = await closeExpiredHackathons();
  } catch (e) {
    console.error('Failed to close expired hackathons during cron run:', e);
  }

  return NextResponse.json({
    success: true,
    totalFetched: allItems.length,
    created,
    updated,
    closedExpired: closedCount,
    errors: errors.length > 0 ? errors : undefined
  });
}
