import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const redis = getRedis();
  const key = await redis.get<string>(`session:${sessionId}`);
  if (!key) {
    return NextResponse.json({ error: 'Key not found. It may still be processing.' }, { status: 404 });
  }

  return NextResponse.json({ key });
}
