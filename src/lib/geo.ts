import { getRedis } from "@/lib/redis";

// Resolve an Indian PIN code to its city/district using the free India Post API.
// Successful lookups are cached in Redis (30 days) — they're effectively static.
export async function resolvePincode(
  pincode: string
): Promise<{ city: string; state: string } | null> {
  if (!/^\d{6}$/.test(pincode)) return null;

  const redis = getRedis();
  const key = `geo:pin:${pincode}`;
  if (redis) {
    try {
      const hit = await redis.get<{ city: string; state: string }>(key);
      if (hit) return hit;
    } catch {
      /* ignore cache read errors */
    }
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const po = data?.[0]?.PostOffice?.[0];
    if (!po) return null;
    const result = { city: po.District as string, state: po.State as string };
    if (redis) {
      try {
        await redis.set(key, result, { ex: 60 * 60 * 24 * 30 });
      } catch {
        /* ignore cache write errors */
      }
    }
    return result;
  } catch {
    return null;
  }
}

export const isPincode = (q: string) => /^\d{6}$/.test(q.trim());
