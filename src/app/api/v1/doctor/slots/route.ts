import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// The doctor's own availability slots (upcoming first).
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const slots = await prisma.doctorSlot.findMany({
    where: { doctor_id: auth.doctorID },
    orderBy: { start_at: "asc" },
  });
  return Response.json({ slots });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();

  const b = await request.json().catch(() => ({}));
  const start = b.start_at ? new Date(b.start_at) : null;
  const capacity = Math.max(1, Math.round(Number(b.capacity) || 1));
  const durationMin = Math.max(10, Math.round(Number(b.duration_min) || 30));

  if (!start || isNaN(start.getTime())) {
    return Response.json({ message: "A valid start time is required." }, { status: 400 });
  }
  if (start.getTime() < Date.now()) {
    return Response.json({ message: "Slot must be in the future." }, { status: 400 });
  }
  const end = new Date(start.getTime() + durationMin * 60 * 1000);

  const slot = await prisma.doctorSlot.create({
    data: {
      doctor_id: auth.doctorID as string,
      start_at: start,
      end_at: end,
      capacity,
    },
  });
  return Response.json({ slot });
}
