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
 * Generate (upsert) platform-fee invoices for every lab that had paid orders
 * in the given month. Re-running updates GMV/fee but preserves invoice status.
 * `period` is "YYYY-MM".
 */
export async function generateInvoices(period: string) {
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

  const invoices = [];
  for (const [lab_id, gmv] of gmvByLab) {
    const fee = feeForGmv(Math.round(gmv / 100)) * 100; // paise
    const invoice = await prisma.invoice.upsert({
      where: { lab_id_period: { lab_id, period } },
      update: { gmv, fee }, // keep existing status on re-run
      create: { lab_id, period, gmv, fee, status: "PENDING" },
    });
    invoices.push(invoice);
  }
  return invoices;
}
