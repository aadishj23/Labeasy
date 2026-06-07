import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { runPlatformFees, isValidPeriod } from "@/lib/billing";

const PENDING_STATUSES = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
] as const;

// Per-lab wallet balances + pending earnings.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const [labs, balances, pendings] = await Promise.all([
    prisma.lab.findMany({ select: { id: true, lab_name: true } }),
    prisma.walletEntry.groupBy({ by: ["lab_id"], _sum: { amount: true } }),
    prisma.order.groupBy({
      by: ["lab_id"],
      where: { status: { in: PENDING_STATUSES as any } },
      _sum: { total: true },
    }),
  ]);

  const balMap = new Map(balances.map((b) => [b.lab_id, b._sum.amount || 0]));
  const penMap = new Map(pendings.map((p) => [p.lab_id, p._sum.total || 0]));

  const rows = labs
    .map((l) => ({
      id: l.id,
      lab_name: l.lab_name,
      balance: balMap.get(l.id) || 0,
      pending: penMap.get(l.id) || 0,
    }))
    .filter((r) => r.balance !== 0 || r.pending !== 0)
    .sort((a, b) => b.balance - a.balance);

  return Response.json({ labs: rows });
}

// Run the monthly platform fee (debits each lab's wallet).
export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const { period } = await request.json().catch(() => ({}));
  if (!period || !isValidPeriod(period)) {
    return Response.json(
      { message: "A valid period (YYYY-MM) is required." },
      { status: 400 }
    );
  }

  const charged = await runPlatformFees(period);
  return Response.json({ ok: true, charged });
}
