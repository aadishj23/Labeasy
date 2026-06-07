import prisma from "@/lib/prisma";
import { cached } from "@/lib/redis";

/**
 * Lab IDs with a live, paid sponsorship. Pass a testId for a test page
 * (EVERYWHERE scope or a sponsorship targeting that test); omit it for the
 * /labs directory (EVERYWHERE or DIRECTORY scope).
 *
 * Cached for 60s (arrays in Redis, rebuilt into a Set) — sponsorship state
 * changes rarely, and this runs on every labs/test page render.
 */
export async function liveSponsoredLabIds(testId?: string): Promise<Set<string>> {
  const ids = await cached(
    `sponsored:${testId ?? "directory"}`,
    60,
    async () => {
      const now = new Date();
      const base = {
        active: true,
        AND: [
          { OR: [{ starts_at: null }, { starts_at: { lte: now } }] },
          { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
        ],
      };

      const where = testId
        ? {
            ...base,
            OR: [{ scope: "EVERYWHERE" }, { test_ids: { has: testId } }],
          }
        : { ...base, scope: { in: ["EVERYWHERE", "DIRECTORY"] } };

      const rows = await prisma.sponsoredListing.findMany({
        where,
        select: { lab_id: true },
      });
      return rows.map((r) => r.lab_id);
    }
  );
  return new Set(ids);
}
