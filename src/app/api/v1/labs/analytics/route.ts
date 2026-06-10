import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { feeForGmv } from "@/lib/billing";

const PAID = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
  "COMPLETED",
];
const ACTIVE = ["CONFIRMED", "SAMPLE_COLLECTED", "PROCESSING", "REPORT_READY"];

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const [orders, lab] = await Promise.all([
    prisma.order.findMany({
      where: { lab_id: auth.labID },
      select: {
        status: true,
        total: true,
        source: true,
        created_at: true,
        items: { select: { test_name: true } },
      },
    }),
    prisma.lab.findUnique({
      where: { id: auth.labID },
      select: { rating_avg: true, rating_count: true },
    }),
  ]);

  const allPaid = orders.filter((o) => PAID.includes(o.status));
  const paid = allPaid.filter((o) => o.source === "PLATFORM");
  const manualPaid = allPaid.filter((o) => o.source === "MANUAL");
  const platformOrders = orders.filter((o) => o.source === "PLATFORM");
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const gmvTotal = paid.reduce((s, o) => s + o.total, 0);
  const gmvMonth = paid
    .filter((o) => new Date(o.created_at) >= monthStart)
    .reduce((s, o) => s + o.total, 0);
  const offPlatformGmv = manualPaid.reduce((s, o) => s + o.total, 0);

  // Last 6 months revenue (rupees, on-platform).
  const monthly: { label: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const rev = paid
      .filter((o) => {
        const c = new Date(o.created_at);
        return c >= from && c < to;
      })
      .reduce((s, o) => s + o.total, 0);
    monthly.push({
      label: from.toLocaleString("en-US", { month: "short" }),
      revenue: Math.round(rev / 100),
    });
  }

  // Top tests by order frequency.
  const counts: Record<string, number> = {};
  paid.forEach((o) =>
    o.items.forEach((it) => {
      counts[it.test_name] = (counts[it.test_name] || 0) + 1;
    })
  );
  const topTests = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const gmvMonthRupees = Math.round(gmvMonth / 100);

  return Response.json({
    summary: {
      gmvTotal: Math.round(gmvTotal / 100),
      gmvMonth: gmvMonthRupees,
      bookings: paid.length,
      completed: platformOrders.filter((o) => o.status === "COMPLETED").length,
      active: platformOrders.filter((o) => ACTIVE.includes(o.status)).length,
      cancelled: platformOrders.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      ).length,
      offPlatformOrders: manualPaid.length,
      offPlatformGmv: Math.round(offPlatformGmv / 100),
      ratingAvg: lab?.rating_avg || 0,
      ratingCount: lab?.rating_count || 0,
      platformFee: feeForGmv(gmvMonthRupees),
    },
    monthly,
    topTests,
  });
}
