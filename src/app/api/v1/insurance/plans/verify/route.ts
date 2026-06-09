import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { postEntry } from "@/lib/wallet";

// Confirm a paid policy + credit the insurer's wallet (gross − commission).
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { purchaseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await request.json().catch(() => ({}));

  if (!purchaseId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ message: "Missing payment details." }, { status: 400 });
  }

  const purchase = await prisma.policyPurchase.findUnique({ where: { id: purchaseId } });
  if (!purchase || purchase.user_id !== auth.userID || purchase.provider_order_id !== razorpay_order_id) {
    return Response.json({ message: "Purchase not found." }, { status: 404 });
  }
  if (purchase.status === "CONFIRMED") return Response.json({ ok: true });

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return Response.json({ message: "Payment verification failed." }, { status: 400 });
  }

  await prisma.policyPurchase.update({
    where: { id: purchaseId },
    data: { status: "CONFIRMED", provider_payment_id: razorpay_payment_id },
  });

  // A purchase auto-converts the buyer's open lead(s) for this insurer.
  await prisma.insuranceLead.updateMany({
    where: { company_id: purchase.company_id, user_id: auth.userID as string, status: "CLICKED" },
    data: { status: "CONVERTED", converted_at: new Date() },
  });

  // Record coupon redemption (idempotent via ref_id unique).
  if (purchase.coupon_id) {
    try {
      await prisma.$transaction([
        prisma.couponRedemption.create({
          data: { coupon_id: purchase.coupon_id, ref_id: purchase.id, user_id: purchase.user_id },
        }),
        prisma.coupon.update({
          where: { id: purchase.coupon_id },
          data: { used_count: { increment: 1 } },
        }),
      ]);
    } catch {
      /* already recorded */
    }
  }

  // Insurer wallet gets the gross minus the platform commission (idempotent).
  const refId = `policy:${purchase.id}`;
  const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
  if (!exists) {
    await postEntry({
      ownerType: "INSURANCE",
      ownerId: purchase.company_id,
      amount: purchase.amount - purchase.commission,
      type: "ORDER_EARNING",
      description: "Policy sale (net of commission)",
      refId,
    });
  }

  return Response.json({ ok: true });
}
