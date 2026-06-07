import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

async function ownAddress(userId: string, id: string) {
  const addr = await prisma.address.findUnique({ where: { id } });
  return addr && addr.user_id === userId ? addr : null;
}

// Update an address or set it as default.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { id } = await params;
  if (!(await ownAddress(auth.userID as string, id))) {
    return Response.json({ message: "Address not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  for (const f of ["label", "line1", "line2", "city", "state", "pincode"]) {
    if (body[f] !== undefined) data[f] = body[f] || null;
  }
  if (body.pincode !== undefined && !/^\d{6}$/.test(String(body.pincode))) {
    return Response.json({ message: "Pincode must be 6 digits." }, { status: 400 });
  }

  const address = await prisma.$transaction(async (tx) => {
    if (body.is_default === true) {
      await tx.address.updateMany({
        where: { user_id: auth.userID },
        data: { is_default: false },
      });
      data.is_default = true;
    }
    return tx.address.update({ where: { id }, data });
  });

  return Response.json({ address });
}

// Delete an address.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { id } = await params;
  const addr = await ownAddress(auth.userID as string, id);
  if (!addr) {
    return Response.json({ message: "Address not found." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  // If we removed the default, promote another address to default.
  if (addr.is_default) {
    const next = await prisma.address.findFirst({
      where: { user_id: auth.userID },
      orderBy: { id: "asc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { is_default: true },
      });
    }
  }

  return Response.json({ ok: true });
}
