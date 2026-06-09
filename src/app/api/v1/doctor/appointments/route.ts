import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// The doctor's confirmed/completed appointments (newest first).
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const appointments = await prisma.appointment.findMany({
    where: { doctor_id: auth.doctorID, status: { not: "PLACED" } },
    orderBy: { scheduled_at: "desc" },
    include: { user: { select: { name: true, phone: true } } },
  });
  return Response.json({ appointments });
}
