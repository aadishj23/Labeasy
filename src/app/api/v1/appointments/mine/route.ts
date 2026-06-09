import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// The patient's doctor appointments (platform-booked), newest first.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const appointments = await prisma.appointment.findMany({
    where: { user_id: auth.userID, source: "PLATFORM" },
    orderBy: { scheduled_at: "desc" },
    include: {
      doctor: { select: { name: true, specialty: true, clinic: true, city: true } },
    },
  });
  return Response.json({ appointments });
}
