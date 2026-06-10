import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

async function ownAdminCoupon(id: string) {
  const c = await prisma.coupon.findUnique({ where: { id } });
  return c && c.owner_type === "ADMIN" ? c : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  if (!(await ownAdminCoupon(id))) return Response.json({ message: "Coupon not found." }, { status: 404 });
  const b = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (b.active !== undefined) data.active = !!b.active;
  const coupon = await prisma.coupon.update({ where: { id }, data });
  return Response.json({ coupon });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  if (!(await ownAdminCoupon(id))) return Response.json({ message: "Coupon not found." }, { status: 404 });
  await prisma.coupon.delete({ where: { id } });
  return Response.json({ ok: true });
}
