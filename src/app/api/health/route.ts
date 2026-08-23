import { hasCoreDatabase } from '@/lib/db/core';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    data: {
      service: 'hackmate-web',
      status: 'ok',
      databaseConfigured: hasCoreDatabase(),
      timestamp: new Date().toISOString(),
    },
    error: null,
  });
}
