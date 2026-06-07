import prisma from "@/lib/prisma";

export type WalletEntryType =
  | "ORDER_EARNING"
  | "PLATFORM_FEE"
  | "SPONSORSHIP"
  | "TOPUP"
  | "PAYOUT"
  | "ADJUSTMENT";

// Net wallet balance (paise). Positive = company owes the lab (settleable);
// negative = lab owes the company (outstanding).
export async function labBalance(labId: string): Promise<number> {
  const agg = await prisma.walletEntry.aggregate({
    where: { lab_id: labId },
    _sum: { amount: true },
  });
  return agg._sum.amount || 0;
}

// Pending earnings: paid orders not yet completed (credited on completion).
export async function labPending(labId: string): Promise<number> {
  const agg = await prisma.order.aggregate({
    where: {
      lab_id: labId,
      status: {
        in: ["CONFIRMED", "SAMPLE_COLLECTED", "PROCESSING", "REPORT_READY"],
      },
    },
    _sum: { total: true },
  });
  return agg._sum.total || 0;
}

// Credit a completed order's revenue to the lab's wallet (idempotent via ref_id).
export async function creditOrderEarning(order: {
  id: string;
  lab_id: string;
  total: number;
}) {
  const refId = `order:${order.id}`;
  const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
  if (exists) return;
  await prisma.walletEntry.create({
    data: {
      lab_id: order.lab_id,
      amount: order.total,
      type: "ORDER_EARNING",
      description: "Order earnings (completed)",
      ref_id: refId,
    },
  });
}

// Post a signed ledger entry. `refId` enables idempotency where needed.
export async function postEntry(opts: {
  labId: string;
  amount: number; // signed paise
  type: WalletEntryType;
  description?: string;
  refId?: string;
}) {
  return prisma.walletEntry.create({
    data: {
      lab_id: opts.labId,
      amount: opts.amount,
      type: opts.type,
      description: opts.description ?? null,
      ref_id: opts.refId ?? null,
    },
  });
}
