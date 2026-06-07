import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// List all sponsorships (with lab + test names).
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const listings = await prisma.sponsoredListing.findMany({
    orderBy: { created_at: "desc" },
    include: { lab: { select: { lab_name: true } } },
  });

  const testIds = [
    ...new Set(listings.map((l) => l.test_id).filter(Boolean) as string[]),
  ];
  const tests = testIds.length
    ? await prisma.tests.findMany({
        where: { id: { in: testIds } },
        select: { id: true, test_name: true },
      })
    : [];
  const testMap = Object.fromEntries(tests.map((t) => [t.id, t.test_name]));

  return Response.json({
    listings: listings.map((l) => ({
      ...l,
      test_name: l.test_id ? testMap[l.test_id] ?? "Unknown test" : null,
    })),
  });
}

// Create a sponsorship.
export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const body = await request.json().catch(() => ({}));
  const labId = String(body.labId || "");
  if (!labId) {
    return Response.json({ message: "A lab is required." }, { status: 400 });
  }

  const listing = await prisma.sponsoredListing.create({
    data: {
      lab_id: labId,
      test_id: body.testId || null,
      starts_at: body.starts_at ? new Date(body.starts_at) : null,
      ends_at: body.ends_at ? new Date(body.ends_at) : null,
    },
  });
  return Response.json({ listing });
}
