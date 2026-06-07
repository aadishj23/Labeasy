import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { notifyOrderStatus } from "@/lib/email";

// Forward-only manual progression; CANCELLED allowed from any non-terminal
// state. COMPLETED is NOT settable here — it's reached only on report upload.
const NEXT: Record<string, string> = {
  PLACED: "CONFIRMED",
  CONFIRMED: "SAMPLE_COLLECTED",
  SAMPLE_COLLECTED: "PROCESSING",
};
const TERMINAL = ["COMPLETED", "CANCELLED", "REFUNDED"];

export async function PATCH(request: Request, { params }) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  const { status, reason } = await request.json().catch(() => ({}));

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.lab_id !== auth.labID) {
    return Response.json({ message: "Order not found." }, { status: 404 });
  }

  // Enforce a valid transition: next step in sequence, or cancel.
  if (TERMINAL.includes(order.status)) {
    return Response.json(
      { message: `This booking is ${order.status.toLowerCase()} and can't be changed.` },
      { status: 400 }
    );
  }
  const isValid = status === NEXT[order.status] || status === "CANCELLED";
  if (!isValid) {
    return Response.json(
      { message: "Bookings can only move forward one step, or be cancelled." },
      { status: 400 }
    );
  }

  // A cancellation must include a remark shown to the patient.
  const cancelReason = String(reason || "").trim();
  if (status === "CANCELLED" && !cancelReason) {
    return Response.json(
      { message: "A reason is required to cancel a booking." },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(status === "CANCELLED" ? { cancel_reason: cancelReason } : {}),
    },
    include: {
      user: { select: { email: true } },
      lab: { select: { lab_name: true } },
      items: { select: { test_name: true } },
    },
  });

  // Lifecycle email to the patient (fire-and-forget).
  void notifyOrderStatus({
    patientEmail: updated.user?.email,
    labName: updated.lab?.lab_name,
    status: updated.status,
    items: updated.items,
  });

  return Response.json({ ok: true, status: updated.status });
}
