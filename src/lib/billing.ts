import prisma from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

const PAID: OrderStatus[] = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
  "COMPLETED",
];

// Performance-based platform fee on monthly GMV (rupees), per info.txt slabs.
export function feeForGmv(gmvRupees: number): number {
  if (gmvRupees <= 20000) return 0;
  if (gmvRupees <= 30000) return 500;
  if (gmvRupees <= 50000) return 1000;
  return 1000 + Math.round((gmvRupees - 50000) * 0.02); // progressive above ₹50k
}

export function isValidPeriod(period: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}

/**
 * Post the monthly platform fee for each lab to its wallet (a debit). The fee is
 * deducted from the lab's balance (not billed separately). Idempotent per
 * lab+period via the wallet entry's ref_id; re-running skips already-charged labs.
 * `period` is "YYYY-MM".
 */
export async function runPlatformFees(period: string) {
  const [y, m] = period.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);

  const orders = await prisma.order.findMany({
    where: { status: { in: PAID }, created_at: { gte: from, lt: to } },
    select: { lab_id: true, total: true },
  });

  const gmvByLab = new Map<string, number>();
  for (const o of orders) {
    gmvByLab.set(o.lab_id, (gmvByLab.get(o.lab_id) || 0) + o.total);
  }

  // Doctor consult GMV for the same period (completed, on-platform).
  const appts = await prisma.appointment.findMany({
    where: { status: "COMPLETED", source: "PLATFORM", scheduled_at: { gte: from, lt: to } },
    select: { doctor_id: true, fee: true },
  });
  const gmvByDoctor = new Map<string, number>();
  for (const a of appts) {
    gmvByDoctor.set(a.doctor_id, (gmvByDoctor.get(a.doctor_id) || 0) + a.fee);
  }

  let charged = 0;

  // The same GMV-slab fee applies to labs and doctors (deducted from each wallet).
  const chargeVendor = async (
    ownerType: "LAB" | "DOCTOR",
    ownerId: string,
    gmv: number,
    refId: string
  ) => {
    const feePaise = feeForGmv(Math.round(gmv / 100)) * 100;
    if (feePaise <= 0) return;
    const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
    if (exists) return; // already charged this month
    await prisma.walletEntry.create({
      data: {
        owner_type: ownerType,
        owner_id: ownerId,
        amount: -feePaise,
        type: "PLATFORM_FEE",
        description: `Platform fee for ${period} (GMV ₹${Math.round(gmv / 100)})`,
        ref_id: refId,
      },
    });
    charged++;
  };

  // Keep the lab ref_id format unchanged for backward-compatible idempotency.
  for (const [lab_id, gmv] of gmvByLab) await chargeVendor("LAB", lab_id, gmv, `fee:${lab_id}:${period}`);
  for (const [doctor_id, gmv] of gmvByDoctor)
    await chargeVendor("DOCTOR", doctor_id, gmv, `fee:DOCTOR:${doctor_id}:${period}`);

  return charged;
}
