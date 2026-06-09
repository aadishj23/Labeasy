import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";

// Confirm a paid appointment + reserve the slot.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await request.json().catch(() => ({}));

  if (!appointmentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ message: "Missing payment details." }, { status: 400 });
  }

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appt || appt.user_id !== auth.userID || appt.provider_order_id !== razorpay_order_id) {
    return Response.json({ message: "Appointment not found." }, { status: 404 });
  }
  if (appt.status !== "PLACED") {
    return Response.json({ ok: true }); // already processed
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return Response.json({ message: "Payment verification failed." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "CONFIRMED", provider_payment_id: razorpay_payment_id },
    }),
    ...(appt.slot_id
      ? [
          prisma.doctorSlot.update({
            where: { id: appt.slot_id },
            data: { booked_count: { increment: 1 } },
          }),
        ]
      : []),
  ]);

  return Response.json({ ok: true });
}
