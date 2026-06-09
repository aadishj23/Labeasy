import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const doctor = await prisma.doctor.findUnique({
    where: { id: auth.doctorID },
    select: {
      id: true, name: true, email: true, specialty: true, city: true,
      pincode: true, clinic: true, phone: true, fee: true, description: true,
      status: true, active: true,
    },
  });
  if (!doctor) return Response.json({ message: "Not found." }, { status: 404 });
  return Response.json({ doctor });
}
