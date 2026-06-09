import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { notifyOrderConfirmed } from "@/lib/email";

export async function POST(request: Request) {
  const authData = await verifyAuth();
  if (!authData) return unauthorized();
  if (authData.type !== "user") {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json().catch(() => ({}));

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ message: "Missing payment details." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        items: { select: { test_name: true } },
        user: { select: { name: true, email: true } },
        lab: { select: { lab_name: true, email: true } },
      },
    });

    // Ownership + matching Razorpay order checks
    if (
      !order ||
      order.user_id !== authData.userID ||
      order.payment?.provider_order_id !== razorpay_order_id
    ) {
      return Response.json({ message: "Order not found." }, { status: 404 });
    }

    const valid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!valid) {
      await prisma.payment.update({
        where: { order_id: order.id },
        data: { status: "FAILED" },
      });
      return Response.json(
        { message: "Payment verification failed." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { order_id: order.id },
        data: { status: "PAID", provider_payment_id: razorpay_payment_id },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: "CONFIRMED" },
      }),
    ]);

    // Record coupon redemption on successful payment (idempotent via ref_id unique).
    if (order.coupon_id) {
      try {
        await prisma.$transaction([
          prisma.couponRedemption.create({
            data: {
              coupon_id: order.coupon_id,
              ref_id: order.id,
              user_id: order.user_id,
            },
          }),
          prisma.coupon.update({
            where: { id: order.coupon_id },
            data: { used_count: { increment: 1 } },
          }),
        ]);
      } catch {
        /* already recorded (unique order_id) — ignore */
      }
    }

    // Fire-and-forget confirmation emails (never block the response).
    notifyOrderConfirmed({
      patientEmail: order.user?.email,
      patientName: order.user?.name,
      labEmail: order.lab?.email,
      labName: order.lab?.lab_name,
      items: order.items,
      total: order.total,
    }).catch(() => {});

    return Response.json({ ok: true, orderId: order.id });
  } catch (error) {
    console.error("Error in /orders/verify route:", error);
    return Response.json(
      { message: "Could not verify payment. Please contact support." },
      { status: 500 }
    );
  }
}
