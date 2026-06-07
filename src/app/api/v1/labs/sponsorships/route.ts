import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// The current lab's sponsorships (paid placements), newest first.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const listings = await prisma.sponsoredListing.findMany({
    where: { lab_id: auth.labID, active: true },
    orderBy: { created_at: "desc" },
  });

  // Resolve test names for TESTS-scope listings.
  const testIds = [...new Set(listings.flatMap((l) => l.test_ids))];
  const tests = testIds.length
    ? await prisma.tests.findMany({
        where: { id: { in: testIds } },
        select: { id: true, test_name: true },
      })
    : [];
  const nameMap = Object.fromEntries(tests.map((t) => [t.id, t.test_name]));

  return Response.json({
    listings: listings.map((l) => ({
      ...l,
      test_names: l.test_ids.map((id) => nameMap[id] || "Test"),
    })),
  });
}
