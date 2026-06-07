// Resolve an Indian PIN code to its city/district using the free India Post API.
// Cached for a day. Used so a pincode search also matches labs by city.
export async function resolvePincode(
  pincode: string
): Promise<{ city: string; state: string } | null> {
  if (!/^\d{6}$/.test(pincode)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const po = data?.[0]?.PostOffice?.[0];
    if (!po) return null;
    return { city: po.District as string, state: po.State as string };
  } catch {
    return null;
  }
}

export const isPincode = (q: string) => /^\d{6}$/.test(q.trim());
