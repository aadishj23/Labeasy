import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Doctor manually marks a slot booked for an off-platform patient.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const { id } = await params;

  const { patient_name, patient_phone, paid_status, amount_paid } = await request
    .json()
    .catch(() => ({}));

  if (!patient_name || !String(patient_name).trim()) {
    return Response.json({ message: "Patient name is required." }, { status: 400 });
  }
  if (!["PAID", "UNPAID", "PARTIAL"].includes(paid_status)) {
    return Response.json({ message: "Please select a payment status." }, { status: 400 });
  }

  const slot = await prisma.doctorSlot.findUnique({
    where: { id },
    include: { doctor: { select: { fee: true } } },
  });
  if (!slot || slot.doctor_id !== auth.doctorID) {
    return Response.json({ message: "Slot not found." }, { status: 404 });
  }
  if (slot.booked_count >= slot.capacity) {
    return Response.json({ message: "This slot is full." }, { status: 400 });
  }

  const fee = Math.max(0, Math.round((slot.doctor?.fee || 0) * 100)); // paise
  const paid =
    paid_status === "PAID"
      ? fee
      : paid_status === "PARTIAL"
        ? Math.max(0, Math.min(fee, Math.round((Number(amount_paid) || 0) * 100)))
        : 0;

  await prisma.$transaction([
    prisma.appointment.create({
      data: {
        doctor_id: auth.doctorID as string,
        slot_id: slot.id,
        source: "MANUAL",
        status: "CONFIRMED",
        patient_name: String(patient_name).trim(),
        patient_phone: patient_phone ? String(patient_phone).trim() : null,
        scheduled_at: slot.start_at,
        fee,
        paid_status,
        amount_paid: paid,
      },
    }),
    prisma.doctorSlot.update({
      where: { id: slot.id },
      data: { booked_count: { increment: 1 } },
    }),
  ]);

  return Response.json({ ok: true });
}
