import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

async function ownPackage(labId: string, id: string) {
  const pkg = await prisma.package.findUnique({ where: { id } });
  return pkg && pkg.lab_id === labId ? pkg : null;
}

// Toggle active / edit basic fields.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  if (!(await ownPackage(auth.labID as string, id))) {
    return Response.json({ message: "Package not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (body.active !== undefined) data.active = !!body.active;
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.description !== undefined) data.description = body.description || null;
  if (body.price !== undefined) {
    if (!Number.isFinite(Number(body.price)) || Number(body.price) <= 0) {
      return Response.json({ message: "Enter a valid price." }, { status: 400 });
    }
    data.price = Math.round(Number(body.price));
  }
  if (body.mrp !== undefined) data.mrp = body.mrp ? Math.round(Number(body.mrp)) : null;

  const pkg = await prisma.package.update({ where: { id }, data });
  return Response.json({ package: pkg });
}

// Delete a package.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { id } = await params;
  if (!(await ownPackage(auth.labID as string, id))) {
    return Response.json({ message: "Package not found." }, { status: 404 });
  }

  await prisma.package.delete({ where: { id } });
  return Response.json({ ok: true });
}
