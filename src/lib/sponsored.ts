import prisma from "@/lib/prisma";
import { cached } from "@/lib/redis";

function liveWindow() {
  const now = new Date();
  return {
    active: true,
    AND: [
      { OR: [{ starts_at: null }, { starts_at: { lte: now } }] },
      { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
    ],
  };
}

/**
 * Lab IDs with a live, paid sponsorship. Pass a testId for a test page
 * (EVERYWHERE scope or a sponsorship targeting that test); omit it for the
 * /labs directory (EVERYWHERE or DIRECTORY scope). Cached 60s.
 */
export async function liveSponsoredLabIds(testId?: string): Promise<Set<string>> {
  const ids = await cached(
    `sponsored:lab:${testId ?? "directory"}`,
    60,
    async () => {
      const base = { ...liveWindow(), owner_type: "LAB" };
      const where = testId
        ? { ...base, OR: [{ scope: "EVERYWHERE" }, { test_ids: { has: testId } }] }
        : { ...base, scope: { in: ["EVERYWHERE", "DIRECTORY"] } };
      const rows = await prisma.sponsoredListing.findMany({
        where,
        select: { owner_id: true },
      });
      return rows.map((r) => r.owner_id);
    }
  );
  return new Set(ids);
}

/** Vendor (doctor/insurer) IDs with a live FEATURED placement. Cached 60s. */
export async function featuredVendorIds(
  ownerType: "DOCTOR" | "INSURANCE"
): Promise<Set<string>> {
  const ids = await cached(`sponsored:featured:${ownerType}`, 60, async () => {
    const rows = await prisma.sponsoredListing.findMany({
      where: { ...liveWindow(), owner_type: ownerType, scope: "FEATURED" },
      select: { owner_id: true },
    });
    return rows.map((r) => r.owner_id);
  });
  return new Set(ids);
}
