import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// All active doctors in the patient's pincode (from their default address).
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const address = await prisma.address.findFirst({
    where: { user_id: auth.userID as string },
    orderBy: [{ is_default: "desc" }, { id: "asc" }],
    select: { pincode: true },
  });

  const pincode = address?.pincode || null;
  if (!pincode) {
    return Response.json({ doctors: [], pincode: null });
  }

  const doctors = await prisma.doctor.findMany({
    where: { active: true, status: "APPROVED", pincode },
    orderBy: { created_at: "desc" },
    take: 24,
  });

  return Response.json({ doctors, pincode });
}
