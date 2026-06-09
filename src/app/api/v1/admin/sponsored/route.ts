import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin monitoring: all sponsorships across vendor types.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const listings = await prisma.sponsoredListing.findMany({
    orderBy: { created_at: "desc" },
  });

  // Resolve owner names + test names.
  const labIds = listings.filter((l) => l.owner_type === "LAB").map((l) => l.owner_id);
  const docIds = listings.filter((l) => l.owner_type === "DOCTOR").map((l) => l.owner_id);
  const insIds = listings.filter((l) => l.owner_type === "INSURANCE").map((l) => l.owner_id);
  const testIds = [...new Set(listings.flatMap((l) => l.test_ids))];

  const [labs, doctors, companies, tests] = await Promise.all([
    prisma.lab.findMany({ where: { id: { in: labIds } }, select: { id: true, lab_name: true } }),
    prisma.doctor.findMany({ where: { id: { in: docIds } }, select: { id: true, name: true } }),
    prisma.insuranceCompany.findMany({ where: { id: { in: insIds } }, select: { id: true, name: true } }),
    testIds.length
      ? prisma.tests.findMany({ where: { id: { in: testIds } }, select: { id: true, test_name: true } })
      : [],
  ]);

  const ownerMap: Record<string, Record<string, string>> = {
    LAB: Object.fromEntries(labs.map((l) => [l.id, l.lab_name])),
    DOCTOR: Object.fromEntries(doctors.map((d) => [d.id, d.name])),
    INSURANCE: Object.fromEntries(companies.map((c) => [c.id, c.name])),
  };
  const testName = Object.fromEntries(tests.map((t) => [t.id, t.test_name]));

  return Response.json({
    listings: listings.map((l) => ({
      ...l,
      ownerName: ownerMap[l.owner_type]?.[l.owner_id] || "—",
      test_names: l.test_ids.map((id) => testName[id] || "Test"),
    })),
  });
}
