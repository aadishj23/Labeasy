import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Cancel a slot: cancel any non-final appointments on it, then delete it.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const { id } = await params;

  const slot = await prisma.doctorSlot.findUnique({ where: { id } });
  if (!slot || slot.doctor_id !== auth.doctorID) {
    return Response.json({ message: "Slot not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.appointment.updateMany({
      where: { slot_id: id, status: { in: ["PLACED", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    }),
    prisma.doctorSlot.delete({ where: { id } }),
  ]);
  return Response.json({ ok: true });
}
