import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api";

const intOrNull = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
};
const dateOrNull = (v: unknown) => (v ? new Date(String(v)) : null);

function vendor(auth: any) {
  if (auth?.type === "doctor") return { ownerType: "DOCTOR", ownerId: auth.doctorID as string };
  if (auth?.type === "insurance") return { ownerType: "INSURANCE", ownerId: auth.insuranceID as string };
  return null;
}

export async function GET() {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const coupons = await prisma.coupon.findMany({
    where: { owner_type: v.ownerType, owner_id: v.ownerId },
    orderBy: { created_at: "desc" },
  });
  return Response.json({ coupons });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").trim().toUpperCase();
  const type = body.type === "FLAT" ? "FLAT" : "PERCENT";
  const value = Math.round(Number(body.value));

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
        owner_type: v.ownerType,
        owner_id: v.ownerId,
        code,
        type,
        value,
        max_discount: intOrNull(body.max_discount),
        min_order: intOrNull(body.min_order),
        starts_at: dateOrNull(body.starts_at),
        ends_at: dateOrNull(body.ends_at),
        usage_limit: intOrNull(body.usage_limit),
        per_user_limit: intOrNull(body.per_user_limit),
      },
    });
    return Response.json({ coupon });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Could not create coupon." }, { status: 500 });
  }
}
