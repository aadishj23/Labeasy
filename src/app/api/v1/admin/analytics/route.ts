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

  const [labs, patients, orders, feeAgg, sponsorAgg, balances, doctorCount, insurerCount, apptAgg, policyAgg, commissionAgg] =
    await Promise.all([
      prisma.lab.findMany({ select: { id: true, lab_name: true, status: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        where: { source: "PLATFORM" }, // exclude labs' off-platform/manual orders
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
      prisma.walletEntry.groupBy({
        by: ["owner_id"],
        where: { owner_type: "LAB" },
        _sum: { amount: true },
      }),
      prisma.doctor.count({ where: { status: "APPROVED" } }),
      prisma.insuranceCompany.count({ where: { status: "APPROVED" } }),
      prisma.appointment.findMany({
        where: { status: "COMPLETED", source: "PLATFORM" },
        select: { fee: true, created_at: true },
      }),
      prisma.policyPurchase.findMany({
        where: { status: "CONFIRMED" },
        select: { amount: true, commission: true, created_at: true },
      }),
      prisma.walletEntry.aggregate({
        where: { type: "COMMISSION" },
        _sum: { amount: true },
      }),
    ]);

  const paid = orders.filter((o) => PAID.includes(o.status));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Combined platform GMV = lab orders + doctor consults + insurance policies.
  const inMonth = (d: any) => new Date(d) >= monthStart;
  const sum = (arr: any[], key: string, pred?: (x: any) => boolean) =>
    arr.filter((x) => (pred ? pred(x) : true)).reduce((s, x) => s + x[key], 0);

  const labGmvTotal = sum(paid, "total");
  const consultGmvTotal = sum(apptAgg, "fee");
  const insuranceGmvTotal = sum(policyAgg, "amount");
  const gmvTotal = labGmvTotal + consultGmvTotal + insuranceGmvTotal;
  const gmvMonth =
    sum(paid, "total", (o) => inMonth(o.created_at)) +
    sum(apptAgg, "fee", (a) => inMonth(a.created_at)) +
    sum(policyAgg, "amount", (p) => inMonth(p.created_at));

  // 6-month combined GMV trend (rupees).
  const monthly: { label: string; gmv: number; lab: number; doctor: number; insurance: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const inRange = (d: any) => {
      const c = new Date(d);
      return c >= from && c < to;
    };
    const lab = sum(paid, "total", (o) => inRange(o.created_at));
    const doctor = sum(apptAgg, "fee", (a) => inRange(a.created_at));
    const insurance = sum(policyAgg, "amount", (p) => inRange(p.created_at));
    monthly.push({
      label: from.toLocaleString("en-US", { month: "short" }),
      gmv: Math.round((lab + doctor + insurance) / 100),
      lab: Math.round(lab / 100),
      doctor: Math.round(doctor / 100),
      insurance: Math.round(insurance / 100),
    });
  }

  // Bookings + GMV per vertical (for the analytics filter).
  const byType = {
    all: { bookings: paid.length + apptAgg.length + policyAgg.length, gmv: Math.round(gmvTotal / 100) },
    lab: { bookings: paid.length, gmv: Math.round(labGmvTotal / 100) },
    doctor: { bookings: apptAgg.length, gmv: Math.round(consultGmvTotal / 100) },
    insurance: { bookings: policyAgg.length, gmv: Math.round(insuranceGmvTotal / 100) },
  };

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
  // On-platform commission (from purchases) + referral commission (off-platform
  // conversions, debited to insurer wallets as negative COMMISSION entries).
  const insuranceCommission =
    sum(policyAgg, "commission") + Math.abs(commissionAgg._sum.amount || 0);
  const consultGmv = consultGmvTotal;
  const insuranceGmv = insuranceGmvTotal;
  const owedToLabs = balances
    .map((b) => b._sum.amount || 0)
    .filter((a) => a > 0)
    .reduce((s, a) => s + a, 0);

  return Response.json({
    summary: {
      labs: labs.length,
      verifiedLabs: labs.filter((l) => l.status === "VERIFIED").length,
      doctors: doctorCount,
      insurers: insurerCount,
      patients,
      gmvTotal: Math.round(gmvTotal / 100),
      gmvMonth: Math.round(gmvMonth / 100),
      labGmv: Math.round(labGmvTotal / 100),
      bookings: paid.length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
      active: orders.filter((o) => ACTIVE.includes(o.status)).length,
      cancelled: orders.filter((o) =>
        ["CANCELLED", "REFUNDED"].includes(o.status)
      ).length,
      consults: apptAgg.length,
      consultGmv: Math.round(consultGmv / 100),
      policies: policyAgg.length,
      insuranceGmv: Math.round(insuranceGmv / 100),
      platformRevenue: Math.round((platformFees + sponsorRevenue + insuranceCommission) / 100),
      platformFees: Math.round(platformFees / 100),
      sponsorRevenue: Math.round(sponsorRevenue / 100),
      insuranceCommission: Math.round(insuranceCommission / 100),
      owedToLabs: Math.round(owedToLabs / 100),
    },
    monthly,
    byType,
    topLabs,
    topTests,
  });
}
