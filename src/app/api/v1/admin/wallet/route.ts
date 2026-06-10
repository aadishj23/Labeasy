import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { postEntry } from "@/lib/wallet";

const PENDING_STATUSES = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
] as const;

// Vendor wallet balances across all types — or one vendor's transactions
// when ?ownerType=&ownerId= is supplied.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const { searchParams } = new URL(request.url);
  const ownerType = searchParams.get("ownerType");
  const ownerId = searchParams.get("ownerId");

  // Single vendor's ledger.
  if (ownerType && ownerId) {
    const entries = await prisma.walletEntry.findMany({
      where: { owner_type: ownerType, owner_id: ownerId },
      orderBy: { created_at: "desc" },
      take: 200,
    });
    return Response.json({ entries });
  }

  const [balances, labs, doctors, companies, pendings] = await Promise.all([
    prisma.walletEntry.groupBy({ by: ["owner_type", "owner_id"], _sum: { amount: true } }),
    prisma.lab.findMany({ select: { id: true, lab_name: true } }),
    prisma.doctor.findMany({ select: { id: true, name: true } }),
    prisma.insuranceCompany.findMany({ select: { id: true, name: true } }),
    prisma.order.groupBy({
      by: ["lab_id"],
      where: { source: "PLATFORM", status: { in: PENDING_STATUSES as any } },
      _sum: { total: true, platform_discount: true },
    }),
  ]);

  const names: Record<string, Record<string, string>> = {
    LAB: Object.fromEntries(labs.map((l) => [l.id, l.lab_name])),
    DOCTOR: Object.fromEntries(doctors.map((d) => [d.id, d.name])),
    INSURANCE: Object.fromEntries(companies.map((c) => [c.id, c.name])),
  };
  const penMap = new Map(
    pendings.map((p) => [p.lab_id, (p._sum.total || 0) + (p._sum.platform_discount || 0)])
  );

  const vendors = balances
    .map((b) => ({
      owner_type: b.owner_type,
      owner_id: b.owner_id,
      name: names[b.owner_type]?.[b.owner_id] || "—",
      balance: b._sum.amount || 0,
      pending: b.owner_type === "LAB" ? penMap.get(b.owner_id) || 0 : 0,
    }))
    .filter((v) => v.balance !== 0 || v.pending !== 0)
    .sort((a, b) => b.balance - a.balance);

  return Response.json({ vendors });
}

// Run payouts — settle every vendor we currently owe (positive balance).
export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const balances = await prisma.walletEntry.groupBy({
    by: ["owner_type", "owner_id"],
    _sum: { amount: true },
  });

  let paid = 0;
  let total = 0;
  for (const b of balances) {
    const bal = b._sum.amount || 0;
    if (bal <= 0) continue;
    const refId = `payout:bulk:${b.owner_type}:${b.owner_id}:${bal}`;
    const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
    if (exists) continue;
    await postEntry({
      ownerType: b.owner_type as any,
      ownerId: b.owner_id,
      amount: -bal,
      type: "PAYOUT",
      description: "Bulk payout",
      refId,
    });
    paid++;
    total += bal;
  }
  return Response.json({ ok: true, paid, total });
}
