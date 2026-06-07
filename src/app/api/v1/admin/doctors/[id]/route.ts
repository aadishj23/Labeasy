import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  const b = await request.json().catch(() => ({}));

  const data: any = {};
  if (typeof b.active === "boolean") data.active = b.active;
  if (b.name !== undefined) data.name = String(b.name).trim();
  if (b.specialty !== undefined) data.specialty = String(b.specialty).trim();
  if (b.pincode !== undefined) {
    const pin = String(b.pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      return Response.json({ message: "Pincode must be 6 digits." }, { status: 400 });
    }
    data.pincode = pin;
  }
  if (b.city !== undefined) data.city = b.city?.trim() || null;
  if (b.clinic !== undefined) data.clinic = b.clinic?.trim() || null;
  if (b.phone !== undefined) data.phone = b.phone?.trim() || null;
  if (b.consult_url !== undefined) data.consult_url = b.consult_url?.trim() || null;
  if (b.blurb !== undefined) data.blurb = b.blurb?.trim() || null;
  if (b.fee !== undefined) data.fee = b.fee ? Math.max(0, Number(b.fee)) : null;

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
