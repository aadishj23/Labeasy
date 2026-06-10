import prisma from "@/lib/prisma";

type CouponResult =
  | {
      coupon: NonNullable<Awaited<ReturnType<typeof prisma.coupon.findFirst>>>;
      discount: number;
      platformBorne: boolean; // true for ADMIN coupons (Labeasy funds the discount)
    }
  | { error: string };

/**
 * Validate a coupon for a vendor purchase and compute its discount (paise).
 * Matches the vendor's own coupon first, else an ADMIN coupon whose scope is
 * ALL or this vendor's type. `subtotal` = value before discounts; `payable` =
 * after any storefront discount.
 */
export async function validateCoupon(opts: {
  ownerType: "LAB" | "DOCTOR" | "INSURANCE";
  ownerId: string;
  code: string;
  subtotal: number;
  payable: number;
  userId?: string | null;
}): Promise<CouponResult> {
  const code = (opts.code || "").trim().toUpperCase();
  if (!code) return { error: "Enter a coupon code." };

  // Vendor's own coupon takes priority; fall back to an applicable admin coupon.
  const coupon =
    (await prisma.coupon.findFirst({
      where: { owner_type: opts.ownerType, owner_id: opts.ownerId, code, active: true },
    })) ||
    (await prisma.coupon.findFirst({
      where: {
        owner_type: "ADMIN",
        code,
        active: true,
        OR: [{ scope: "ALL" }, { scope: opts.ownerType }],
      },
    }));
  if (!coupon) return { error: "Invalid or inactive coupon code." };

  const now = new Date();
  if (coupon.starts_at && now < coupon.starts_at)
    return { error: "This coupon isn't active yet." };
  if (coupon.ends_at && now > coupon.ends_at)
    return { error: "This coupon has expired." };
  if (coupon.min_order != null && opts.subtotal < coupon.min_order * 100)
    return { error: `Minimum order of ₹${coupon.min_order} required.` };
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit)
    return { error: "This coupon is no longer available." };
  if (coupon.per_user_limit != null && opts.userId) {
    const used = await prisma.couponRedemption.count({
      where: { coupon_id: coupon.id, user_id: opts.userId },
    });
    if (used >= coupon.per_user_limit)
      return { error: "You've already used this coupon." };
  }

  let discount =
    coupon.type === "PERCENT"
      ? Math.round(opts.payable * (coupon.value / 100))
      : coupon.value * 100;
  if (coupon.max_discount != null)
    discount = Math.min(discount, coupon.max_discount * 100);
  // Never reduce the payable below ₹1.
  discount = Math.min(discount, Math.max(0, opts.payable - 100));
  if (discount <= 0)
    return { error: "This coupon can't be applied to this order." };

  return { coupon, discount, platformBorne: coupon.owner_type === "ADMIN" };
}
