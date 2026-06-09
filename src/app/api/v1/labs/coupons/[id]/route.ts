import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

async function ownCoupon(labId: string, id: string) {
  const c = await prisma.coupon.findUnique({ where: { id } });
  return c && c.owner_type === "LAB" && c.owner_id === labId ? c : null;
}

// Toggle active (or other simple edits).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  if (!(await ownCoupon(auth.labID as string, id))) {
    return Response.json({ message: "Coupon not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = !!body.active;

  const coupon = await prisma.coupon.update({ where: { id }, data });
  return Response.json({ coupon });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  if (!(await ownCoupon(auth.labID as string, id))) {
    return Response.json({ message: "Coupon not found." }, { status: 404 });
  }

  await prisma.coupon.delete({ where: { id } });
  return Response.json({ ok: true });
}
