import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden, prismaErrorResponse } from "@/lib/api";

const intOrNull = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
};
const dateOrNull = (v: unknown) => (v ? new Date(String(v)) : null);
const SCOPES = ["ALL", "LAB", "DOCTOR", "INSURANCE"];

// Admin-funded coupons: the discount is borne by Labeasy; vendors are paid in full.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const coupons = await prisma.coupon.findMany({
    where: { owner_type: "ADMIN" },
    orderBy: { created_at: "desc" },
  });
  return Response.json({ coupons });
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const b = await request.json().catch(() => ({}));
  const code = String(b.code || "").trim().toUpperCase();
  const type = b.type === "FLAT" ? "FLAT" : "PERCENT";
  const value = Math.round(Number(b.value));
  const scope = SCOPES.includes(b.scope) ? b.scope : "ALL";

  if (!code) return Response.json({ message: "Enter a code." }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0) {
    return Response.json({ message: "Enter a valid discount value." }, { status: 400 });
  }
  if (type === "PERCENT" && value > 100) {
    return Response.json({ message: "Percentage can't exceed 100." }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        owner_type: "ADMIN",
        owner_id: "",
        scope,
        code,
        type,
        value,
        max_discount: intOrNull(b.max_discount),
        min_order: intOrNull(b.min_order),
        starts_at: dateOrNull(b.starts_at),
        ends_at: dateOrNull(b.ends_at),
        usage_limit: intOrNull(b.usage_limit),
        per_user_limit: intOrNull(b.per_user_limit),
      },
    });
    return Response.json({ coupon });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Could not create coupon." }, { status: 500 });
  }
}
