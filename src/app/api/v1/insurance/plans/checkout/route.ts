import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { validateCoupon } from "@/lib/coupons";

// Patient buys a policy — recomputes price server-side, creates a Razorpay
// order + a pending PolicyPurchase.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) return unauthorized();
  if (auth.type !== "user") {
    return Response.json({ message: "Only patients can buy plans." }, { status: 403 });
  }

  const { planId, couponCode } = await request.json().catch(() => ({}));
  if (!planId) return Response.json({ message: "A plan is required." }, { status: 400 });

  const plan = await prisma.insurancePlan.findUnique({
    where: { id: planId },
    include: { company: true },
  });
  if (
    !plan || !plan.active || !plan.commission_approved ||
    !plan.company || plan.company.status !== "APPROVED" || !plan.company.active
  ) {
    return Response.json({ message: "This plan is unavailable." }, { status: 400 });
  }

  // Apply a coupon (insurer's own or an admin coupon), if any.
  let amount = plan.price;
  let coupon_id: string | null = null;
  let platform_discount = 0;
  if (couponCode) {
    const result = await validateCoupon({
      ownerType: "INSURANCE",
      ownerId: plan.company_id,
      code: couponCode,
      subtotal: plan.price,
      payable: plan.price,
      userId: auth.userID,
    });
    if ("error" in result) {
      return Response.json({ message: result.error }, { status: 400 });
    }
    amount = plan.price - result.discount;
    coupon_id = result.coupon!.id;
    if (result.platformBorne) platform_discount = result.discount;
  }
  // Commission is taken on the insurer's gross sale. For admin coupons the
  // insurer still sells at full price (Labeasy funds the discount), so the
  // gross = what the patient paid + the platform-funded discount.
  const commission = Math.round(((amount + platform_discount) * plan.commission_pct) / 100);

  try {
    const rzpOrder = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `pol_${Date.now()}`,
      notes: { type: "policy", planId: plan.id, userId: auth.userID ?? "" },
    });

    const purchase = await prisma.policyPurchase.create({
      data: {
        plan_id: plan.id,
        company_id: plan.company_id,
        user_id: auth.userID as string,
        amount,
        commission,
        coupon_id,
        platform_discount,
        status: "PLACED",
        provider_order_id: rzpOrder.id,
      },
    });

    return Response.json({
      purchaseId: purchase.id,
      razorpayOrderId: rzpOrder.id,
      amount,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("Policy checkout failed:", e);
    return Response.json(
      { message: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
