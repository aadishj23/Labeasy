import { verifyAuth, unauthorized } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupons";

// Preview a doctor/insurer coupon: returns the discount + final amount (paise).
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { ownerType, ownerId, code, amount } = await request.json().catch(() => ({}));
  if (!["DOCTOR", "INSURANCE"].includes(ownerType) || !ownerId || !amount) {
    return Response.json({ valid: false, message: "Invalid request." }, { status: 400 });
  }

  const result = await validateCoupon({
    ownerType,
    ownerId,
    code,
    subtotal: amount,
    payable: amount,
    userId: auth.userID,
  });
  if ("error" in result) {
    return Response.json({ valid: false, message: result.error });
  }
  return Response.json({
    valid: true,
    discount: result.discount,
    final: amount - result.discount,
  });
}
