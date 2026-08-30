import { NextRequest, NextResponse } from 'next/server';
import { getRedis, hasRedis } from '@/lib/redis';
import { publishBeamsNotification } from '@/lib/pusher-beams';

export const runtime = 'nodejs';

export async function GET() {
  const redisConnected = hasRedis();
  let redisPing = 'untested';

  if (redisConnected) {
    try {
      const redis = getRedis();
      if (redis) {
        await redis.set('hackmate:health:check', Date.now(), { ex: 60 });
        const val = await redis.get('hackmate:health:check');
        redisPing = val ? 'ok' : 'failed';
      }
    } catch (e: any) {
      redisPing = `error: ${e.message}`;
    }
  }

  return NextResponse.json({
    status: 'ok',
    services: {
      redis: {
        configured: redisConnected,
        ping: redisPing,
      },
      pusherBeams: {
        configured: true,
        instanceId: 'e73529a8-e692-47fb-b5f7-2c72864c654e',
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interests = ['hello'], title = 'Hello', message = 'Hello from HackMate!' } = body;

    const result = await publishBeamsNotification(interests, {
      title,
      body: message,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
