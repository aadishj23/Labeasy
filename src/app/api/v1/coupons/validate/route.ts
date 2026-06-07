import { verifyAuth, unauthorized } from "@/lib/auth";
import { priceGroup } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";

// Preview a coupon for a per-lab cart group (patient). Returns the discount in paise.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const { labId, code } = body;
  const testIds: string[] = Array.isArray(body.testIds) ? body.testIds : [];
  const packageIds: string[] = Array.isArray(body.packageIds)
    ? body.packageIds
    : [];

  if (!labId || !code) {
    return Response.json(
      { valid: false, message: "Missing coupon or cart." },
      { status: 400 }
    );
  }

  const { subtotal, payable } = await priceGroup(labId, testIds, packageIds);
  if (payable <= 0) {
    return Response.json({ valid: false, message: "Nothing to discount." });
  }

  const result = await validateCoupon({
    labId,
    code,
    subtotal,
    payable,
    userId: auth.userID,
  });
  if ("error" in result) {
    return Response.json({ valid: false, message: result.error });
  }

  return Response.json({
    valid: true,
    code: result.coupon!.code,
    discount: result.discount, // paise
  });
}
