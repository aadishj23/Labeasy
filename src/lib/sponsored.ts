import prisma from "@/lib/prisma";

/**
 * Lab IDs with a live, paid sponsorship. Pass a testId for a test page
 * (EVERYWHERE scope or a sponsorship targeting that test); omit it for the
 * /labs directory (EVERYWHERE or DIRECTORY scope).
 */
export async function liveSponsoredLabIds(testId?: string): Promise<Set<string>> {
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
  return new Set(rows.map((r) => r.lab_id));
}
