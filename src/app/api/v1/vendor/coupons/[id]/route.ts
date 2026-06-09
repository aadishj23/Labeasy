import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { ownerType: "DOCTOR", ownerId: auth.doctorID as string };
  if (auth?.type === "insurance") return { ownerType: "INSURANCE", ownerId: auth.insuranceID as string };
  return null;
}

async function own(v: { ownerType: string; ownerId: string }, id: string) {
  const c = await prisma.coupon.findUnique({ where: { id } });
  return c && c.owner_type === v.ownerType && c.owner_id === v.ownerId ? c : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const { id } = await params;
  if (!(await own(v, id))) return Response.json({ message: "Coupon not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = !!body.active;
  const coupon = await prisma.coupon.update({ where: { id }, data });
  return Response.json({ coupon });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const { id } = await params;
  if (!(await own(v, id))) return Response.json({ message: "Coupon not found." }, { status: 404 });
  await prisma.coupon.delete({ where: { id } });
  return Response.json({ ok: true });
}
