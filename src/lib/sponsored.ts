import prisma from "@/lib/prisma";

/**
 * Lab IDs with a live sponsorship. Pass a testId for a test page (sponsorships
 * targeting that test); omit it for the /labs directory (test_id IS NULL).
 */
export async function liveSponsoredLabIds(testId?: string): Promise<Set<string>> {
  const now = new Date();
  const rows = await prisma.sponsoredListing.findMany({
    where: {
      active: true,
      test_id: testId ?? null,
      AND: [
        { OR: [{ starts_at: null }, { starts_at: { lte: now } }] },
        { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
      ],
    },
    select: { lab_id: true },
  });
  return new Set(rows.map((r) => r.lab_id));
}
