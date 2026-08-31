export const runtime = 'edge';

// Simple keepalive endpoint for Render / Fly.io / Railway to prevent cold starts.
// Set up an external cron (e.g., cron-job.org, UptimeRobot) to ping
// GET /api/keepalive every 10 minutes to keep the instance warm.
export async function GET() {
  return Response.json({
    ok: true,
    alive: true,
    ts: Date.now(),
  });
}
