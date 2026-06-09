import prisma from "@/lib/prisma";

export type WalletEntryType =
  | "ORDER_EARNING"
  | "PLATFORM_FEE"
  | "SPONSORSHIP"
  | "COMMISSION"
  | "TOPUP"
  | "PAYOUT"
  | "ADJUSTMENT";

export type WalletOwnerType = "LAB" | "DOCTOR" | "INSURANCE";

// Net wallet balance (paise) for any vendor. Positive = company owes the vendor
// (settleable); negative = vendor owes the company (outstanding).
export async function ownerBalance(
  ownerType: WalletOwnerType,
  ownerId: string
): Promise<number> {
  const agg = await prisma.walletEntry.aggregate({
    where: { owner_type: ownerType, owner_id: ownerId },
    _sum: { amount: true },
  });
  return agg._sum.amount || 0;
}

// Convenience wrapper for lab callers.
export const labBalance = (labId: string) => ownerBalance("LAB", labId);

// Pending lab earnings: paid orders not yet completed (credited on completion).
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

// Post a signed ledger entry. `refId` enables idempotency where needed.
export async function postEntry(opts: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number; // signed paise
  type: WalletEntryType;
  description?: string;
  refId?: string;
}) {
  return prisma.walletEntry.create({
    data: {
      owner_type: opts.ownerType,
      owner_id: opts.ownerId,
      amount: opts.amount,
      type: opts.type,
      description: opts.description ?? null,
      ref_id: opts.refId ?? null,
    },
  });
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
  await postEntry({
    ownerType: "LAB",
    ownerId: order.lab_id,
    amount: order.total,
    type: "ORDER_EARNING",
    description: "Order earnings (completed)",
    refId,
  });
}

// Credit a completed appointment's fee to the doctor's wallet (idempotent).
export async function creditAppointmentEarning(appt: {
  id: string;
  doctor_id: string;
  fee: number;
}) {
  const refId = `appt:${appt.id}`;
  const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
  if (exists) return;
  await postEntry({
    ownerType: "DOCTOR",
    ownerId: appt.doctor_id,
    amount: appt.fee,
    type: "ORDER_EARNING",
    description: "Consultation earnings (completed)",
    refId,
  });
}
