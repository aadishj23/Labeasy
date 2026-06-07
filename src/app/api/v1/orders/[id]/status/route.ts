import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

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
  });

  return Response.json({ ok: true, status: updated.status });
}
