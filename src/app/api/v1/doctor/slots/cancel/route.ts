import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Cancel many slots at once (e.g. a whole day) — cancels their bookings + deletes.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();

  const { slotIds } = await request.json().catch(() => ({}));
  const ids: string[] = Array.isArray(slotIds) ? slotIds : [];
  if (ids.length === 0) {
    return Response.json({ message: "No slots selected." }, { status: 400 });
  }

  // Only this doctor's slots.
  const owned = await prisma.doctorSlot.findMany({
    where: { id: { in: ids }, doctor_id: auth.doctorID as string },
    select: { id: true },
  });
  const ownedIds = owned.map((s) => s.id);
  if (ownedIds.length === 0) return Response.json({ cancelled: 0 });

  await prisma.$transaction([
    prisma.appointment.updateMany({
      where: { slot_id: { in: ownedIds }, status: { in: ["PLACED", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    }),
    prisma.doctorSlot.deleteMany({ where: { id: { in: ownedIds } } }),
  ]);
  return Response.json({ cancelled: ownedIds.length });
}
