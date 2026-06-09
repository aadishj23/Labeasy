import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Approve / reject a doctor or toggle visibility.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  const b = await request.json().catch(() => ({}));

  const data: any = {};
  if (b.status && ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(b.status)) {
    data.status = b.status;
  }
  if (typeof b.active === "boolean") data.active = b.active;

  const doctor = await prisma.doctor.update({ where: { id }, data });
  return Response.json({ doctor });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  await prisma.doctor.delete({ where: { id } });
  return Response.json({ ok: true });
}
