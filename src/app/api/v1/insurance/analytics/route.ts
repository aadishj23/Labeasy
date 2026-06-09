import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ownerBalance } from "@/lib/wallet";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const id = auth.insuranceID as string;

  const [purchases, leads, balance, convLeads, commissionEntries] = await Promise.all([
    prisma.policyPurchase.findMany({
      where: { company_id: id, status: "CONFIRMED" },
      select: { amount: true, commission: true, created_at: true },
    }),
    prisma.insuranceLead.findMany({ where: { company_id: id }, select: { status: true } }),
    ownerBalance("INSURANCE", id),
    prisma.insuranceLead.findMany({
      where: { company_id: id, status: "CONVERTED", plan_id: { not: null } },
      select: { id: true, plan_id: true },
    }),
    prisma.walletEntry.findMany({
      where: { owner_type: "INSURANCE", owner_id: id, type: "COMMISSION" },
      select: { ref_id: true },
    }),
  ]);

  const gross = purchases.reduce((s, p) => s + p.amount, 0);
  const net = purchases.reduce((s, p) => s + (p.amount - p.commission), 0);

  // Off-platform (manual) conversions = converted leads that incurred a
  // referral commission. Their GMV is the linked plan's price.
  const manualLeadIds = new Set(
    commissionEntries.map((e) => (e.ref_id || "").replace("lead:", ""))
  );
  const manualLeads = convLeads.filter((l) => manualLeadIds.has(l.id));
  const planIds = [...new Set(manualLeads.map((l) => l.plan_id as string))];
  const plans = planIds.length
    ? await prisma.insurancePlan.findMany({ where: { id: { in: planIds } }, select: { id: true, price: true } })
    : [];
  const priceMap = Object.fromEntries(plans.map((p) => [p.id, p.price]));
  const offPlatformGmv = manualLeads.reduce((s, l) => s + (priceMap[l.plan_id as string] || 0), 0);

  const now = new Date();

  const monthly: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const v = purchases
      .filter((p) => {
        const d = new Date(p.created_at);
        return d >= from && d < to;
      })
      .reduce((s, p) => s + (p.amount - p.commission), 0);
    monthly.push({ label: from.toLocaleString("en-US", { month: "short" }), value: Math.round(v / 100) });
  }

  return Response.json({
    summary: {
      sales: purchases.length,
      gross: Math.round(gross / 100),
      net: Math.round(net / 100),
      leads: leads.length,
      conversions: leads.filter((l) => l.status === "CONVERTED").length,
      balance: Math.round(balance / 100),
      offPlatformSales: manualLeads.length,
      offPlatformGmv: Math.round(offPlatformGmv / 100),
    },
    monthly,
  });
}
