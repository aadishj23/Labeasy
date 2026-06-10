import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { upsertVendorPatient } from "@/lib/vendor-patient";

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

  // Record coupon redemption (idempotent via ref_id unique).
  if (appt.coupon_id) {
    try {
      await prisma.$transaction([
        prisma.couponRedemption.create({
          data: { coupon_id: appt.coupon_id, ref_id: appt.id, user_id: appt.user_id! },
        }),
        prisma.coupon.update({
          where: { id: appt.coupon_id },
          data: { used_count: { increment: 1 } },
        }),
      ]);
    } catch {
      /* already recorded */
    }
  }

  // Tag the doctor's patient catalogue (links by phone).
  const user = await prisma.user.findUnique({
    where: { id: appt.user_id as string },
    select: { name: true, phone: true },
  });
  if (user) {
    await upsertVendorPatient({
      vendorType: "DOCTOR",
      vendorId: appt.doctor_id,
      name: user.name,
      phone: user.phone,
      userId: appt.user_id,
    });
  }

  return Response.json({ ok: true });
}
