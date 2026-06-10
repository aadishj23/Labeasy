import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Coupons a patient can use right now for a given vendor — the vendor's own
// active coupons plus admin coupons scoped to ALL / that vendor type.
// Filters out expired, exhausted, and per-user-exhausted coupons.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerType = searchParams.get("ownerType") || "";
  const ownerId = searchParams.get("ownerId") || "";
  if (!["LAB", "DOCTOR", "INSURANCE"].includes(ownerType)) {
    return Response.json({ coupons: [] });
  }

  const now = new Date();
  const auth = await verifyAuth().catch(() => null);
  const userId = auth?.type === "user" ? (auth.userID as string) : null;

  const found = await prisma.coupon.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ starts_at: null }, { starts_at: { lte: now } }] },
        { OR: [{ ends_at: null }, { ends_at: { gte: now } }] },
        {
          OR: [
            { owner_type: ownerType, owner_id: ownerId },
            { owner_type: "ADMIN", OR: [{ scope: "ALL" }, { scope: ownerType }] },
          ],
        },
      ],
    },
    orderBy: { value: "desc" },
  });

  const coupons = [];
  for (const c of found) {
    if (c.usage_limit != null && c.used_count >= c.usage_limit) continue;
    if (c.per_user_limit != null && userId) {
      const used = await prisma.couponRedemption.count({
        where: { coupon_id: c.id, user_id: userId },
      });
      if (used >= c.per_user_limit) continue;
    }
    coupons.push({
      code: c.code,
      label:
        c.type === "PERCENT"
          ? `${c.value}% off${c.max_discount ? ` up to ₹${c.max_discount}` : ""}`
          : `₹${c.value} off`,
      note: c.min_order ? `Min order ₹${c.min_order}` : null,
    });
  }
  return Response.json({ coupons });
}
