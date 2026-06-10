import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { creditAppointmentEarning } from "@/lib/wallet";

// Advance an appointment's status. COMPLETED credits the doctor's wallet.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));

  if (!["COMPLETED", "CANCELLED"].includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }

  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt || appt.doctor_id !== auth.doctorID) {
    return Response.json({ message: "Appointment not found." }, { status: 404 });
  }
  if (["COMPLETED", "CANCELLED"].includes(appt.status)) {
    return Response.json({ message: "Already finalized." }, { status: 400 });
  }

  await prisma.appointment.update({ where: { id }, data: { status } });

  // Only platform-paid consults credit the wallet (manual ones are paid offline).
  if (status === "COMPLETED" && appt.source === "PLATFORM" && appt.fee > 0) {
    await creditAppointmentEarning({
      id: appt.id,
      doctor_id: appt.doctor_id,
      fee: appt.fee,
      platform_discount: appt.platform_discount,
    });
  }

  return Response.json({ ok: true });
}
