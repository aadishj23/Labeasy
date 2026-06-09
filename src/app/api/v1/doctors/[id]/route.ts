import prisma from "@/lib/prisma";

// Public: a doctor's profile + upcoming bookable slots.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: {
      id: true, name: true, specialty: true, city: true, pincode: true,
      clinic: true, phone: true, fee: true, description: true, status: true,
      active: true, rating_avg: true, rating_count: true,
    },
  });
  if (!doctor || doctor.status !== "APPROVED" || !doctor.active) {
    return Response.json({ message: "Doctor not found." }, { status: 404 });
  }

  const slots = await prisma.doctorSlot.findMany({
    where: { doctor_id: id, active: true, start_at: { gte: new Date() } },
    orderBy: { start_at: "asc" },
    take: 50,
  });
  const available = slots.filter((s) => s.booked_count < s.capacity);

  return Response.json({ doctor, slots: available });
}
