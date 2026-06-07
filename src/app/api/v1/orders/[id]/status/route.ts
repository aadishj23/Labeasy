import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { notifyOrderStatus } from "@/lib/email";

const ALLOWED = [
  "CONFIRMED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "REPORT_READY",
  "COMPLETED",
  "CANCELLED",
];

export async function PATCH(request: Request, { params }) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));

  if (!ALLOWED.includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.lab_id !== auth.labID) {
    return Response.json({ message: "Order not found." }, { status: 404 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
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
