import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

const PAID = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
  "COMPLETED",
];
const ACTIVE = ["CONFIRMED", "SAMPLE_COLLECTED", "PROCESSING", "REPORT_READY"];

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const [labs, patients, orders, feeAgg, sponsorAgg, balances] =
    await Promise.all([
      prisma.lab.findMany({ select: { id: true, lab_name: true, status: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        select: {
          status: true,
          total: true,
          created_at: true,
          lab_id: true,
          items: { select: { test_name: true } },
        },
      }),
      prisma.walletEntry.aggregate({
        where: { type: "PLATFORM_FEE" },
        _sum: { amount: true },
      }),
      prisma.sponsoredListing.aggregate({
        where: { active: true },
        _sum: { amount: true },
      }),
      prisma.walletEntry.groupBy({ by: ["lab_id"], _sum: { amount: true } }),
    ]);

  const paid = orders.filter((o) => PAID.includes(o.status));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const gmvTotal = paid.reduce((s, o) => s + o.total, 0);
  const gmvMonth = paid
    .filter((o) => new Date(o.created_at) >= monthStart)
    .reduce((s, o) => s + o.total, 0);

  // 6-month GMV trend (rupees).
  const monthly: { label: string; gmv: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const g = paid
      .filter((o) => {
        const c = new Date(o.created_at);
        return c >= from && c < to;
      })
      .reduce((s, o) => s + o.total, 0);
    monthly.push({
      label: from.toLocaleString("en-US", { month: "short" }),
      gmv: Math.round(g / 100),
    });
  }

  // Top labs by GMV.
  const labGmv: Record<string, number> = {};
  paid.forEach((o) => (labGmv[o.lab_id] = (labGmv[o.lab_id] || 0) + o.total));
  const labName = Object.fromEntries(labs.map((l) => [l.id, l.lab_name]));
  const topLabs = Object.entries(labGmv)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, gmv]) => ({ name: labName[id] || "Lab", gmv: Math.round(gmv / 100) }));

  // Top tests by order frequency.
  const testCount: Record<string, number> = {};
  paid.forEach((o) =>
    o.items.forEach((it) => {
      testCount[it.test_name] = (testCount[it.test_name] || 0) + 1;
    })
  );
  const topTests = Object.entries(testCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const platformFees = Math.abs(feeAgg._sum.amount || 0);
  const sponsorRevenue = sponsorAgg._sum.amount || 0;
  const owedToLabs = balances
    .map((b) => b._sum.amount || 0)
    .filter((a) => a > 0)
    .reduce((s, a) => s + a, 0);

  return Response.json({
    summary: {
      labs: labs.length,
      verifiedLabs: labs.filter((l) => l.status === "VERIFIED").length,
      patients,
      gmvTotal: Math.round(gmvTotal / 100),
      gmvMonth: Math.round(gmvMonth / 100),
      bookings: paid.length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
      active: orders.filter((o) => ACTIVE.includes(o.status)).length,
      cancelled: orders.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      ).length,
      platformRevenue: Math.round((platformFees + sponsorRevenue) / 100),
      platformFees: Math.round(platformFees / 100),
      sponsorRevenue: Math.round(sponsorRevenue / 100),
      owedToLabs: Math.round(owedToLabs / 100),
    },
    monthly,
    topLabs,
    topTests,
  });
}
