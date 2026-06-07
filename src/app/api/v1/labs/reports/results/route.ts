import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { notifyOrderStatus } from "@/lib/email";
import { creditOrderEarning } from "@/lib/wallet";

type AnalyteIn = {
  name?: unknown;
  value?: unknown;
  unit?: unknown;
  ref_low?: unknown;
  ref_high?: unknown;
};

const num = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Lab enters structured analyte results for an order.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || "");
  const rawResults = Array.isArray(body.results) ? body.results : [];

  // Keep only rows with a name + a value.
  const results = (rawResults as AnalyteIn[])
    .map((r) => ({
      name: String(r.name ?? "").trim(),
      value: num(r.value) ?? String(r.value ?? "").trim(),
      unit: String(r.unit ?? "").trim() || null,
      ref_low: num(r.ref_low),
      ref_high: num(r.ref_high),
    }))
    .filter((r) => r.name && r.value !== "");

  if (!orderId || results.length === 0) {
    return Response.json(
      { message: "An order and at least one result row are required." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true } },
      lab: { select: { lab_name: true } },
      items: { select: { test_name: true } },
    },
  });
  if (!order || order.lab_id !== auth.labID) {
    return Response.json({ message: "Order not found." }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      order_id: order.id,
      user_id: order.user_id,
      lab_id: order.lab_id,
      results,
      status: "READY",
    },
  });

  // Entering results completes the order (the only path to COMPLETED).
  const notTerminal = !["COMPLETED", "CANCELLED", "REFUNDED"].includes(
    order.status
  );
  if (notTerminal) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "COMPLETED" },
    });
    // Order is now complete — credit the lab's wallet.
    await creditOrderEarning({
      id: order.id,
      lab_id: order.lab_id,
      total: order.total,
    });
    void notifyOrderStatus({
      patientEmail: order.user?.email,
      labName: order.lab?.lab_name,
      status: "COMPLETED",
      items: order.items,
    });
  }

  return Response.json({ report });
}
