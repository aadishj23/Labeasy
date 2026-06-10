import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { validateCoupon } from "@/lib/coupons";

// Patient books a doctor slot — recomputes the fee server-side, creates a
// Razorpay order + a pending appointment.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) return unauthorized();
  if (auth.type !== "user") {
    return Response.json(
      { message: "Only patients can book consultations." },
      { status: 403 }
    );
  }

  const { slotId, couponCode } = await request.json().catch(() => ({}));
  if (!slotId) {
    return Response.json({ message: "A slot is required." }, { status: 400 });
  }

  const slot = await prisma.doctorSlot.findUnique({
    where: { id: slotId },
    include: { doctor: true },
  });
  if (!slot || !slot.active || slot.start_at < new Date()) {
    return Response.json({ message: "This slot is unavailable." }, { status: 400 });
  }
  if (slot.booked_count >= slot.capacity) {
    return Response.json({ message: "This slot is full." }, { status: 400 });
  }
  const doctor = slot.doctor;
  if (!doctor || doctor.status !== "APPROVED" || !doctor.active) {
    return Response.json({ message: "Doctor unavailable." }, { status: 400 });
  }

  const fullFee = Math.max(0, Math.round((doctor.fee || 0) * 100)); // paise
  if (fullFee <= 0) {
    return Response.json({ message: "Invalid consultation fee." }, { status: 400 });
  }

  // Apply a coupon (doctor's own or an admin coupon), if any.
  let amount = fullFee;
  let coupon_id: string | null = null;
  let platform_discount = 0;
  if (couponCode) {
    const result = await validateCoupon({
      ownerType: "DOCTOR",
      ownerId: doctor.id,
      code: couponCode,
      subtotal: fullFee,
      payable: fullFee,
      userId: auth.userID,
    });
    if ("error" in result) {
      return Response.json({ message: result.error }, { status: 400 });
    }
    amount = fullFee - result.discount;
    coupon_id = result.coupon!.id;
    if (result.platformBorne) platform_discount = result.discount;
  }

  try {
    const rzpOrder = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `appt_${Date.now()}`,
      notes: { type: "appointment", doctorId: doctor.id, userId: auth.userID ?? "" },
    });

    const appt = await prisma.appointment.create({
      data: {
        doctor_id: doctor.id,
        user_id: auth.userID as string,
        slot_id: slot.id,
        scheduled_at: slot.start_at,
        fee: amount,
        coupon_id,
        platform_discount,
        status: "PLACED",
        provider_order_id: rzpOrder.id,
      },
    });

    return Response.json({
      appointmentId: appt.id,
      razorpayOrderId: rzpOrder.id,
      amount,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("Appointment checkout failed:", e);
    return Response.json(
      { message: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
