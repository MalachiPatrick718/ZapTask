import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

interface LicenseRecord {
  email: string;
  tier: string;
  createdAt: string;
  expiresAt: string;
  stripeSessionId: string;
  stripeCustomerId: string;
}

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, error: 'Missing key' }, { status: 400 });
    }

    const redis = getRedis();
    const raw = await redis.get<string>(`license:${key}`);
    if (!raw) {
      return NextResponse.json({ valid: false, error: 'Invalid key' });
    }

    const record: LicenseRecord = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const now = new Date();
    const expiresAt = new Date(record.expiresAt);
    if (now > expiresAt) {
      return NextResponse.json({
        valid: false,
        tier: record.tier,
        expiresAt: record.expiresAt,
        error: 'License expired',
      });
    }

    return NextResponse.json({
      valid: true,
      tier: record.tier,
      expiresAt: record.expiresAt,
      email: record.email,
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
