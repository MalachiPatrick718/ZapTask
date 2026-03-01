import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) {
      throw new Error('Missing Upstash Redis credentials (KV_REST_API_URL / KV_REST_API_TOKEN)');
    }
    _redis = new Redis({ url, token });
  }
  return _redis;
}
