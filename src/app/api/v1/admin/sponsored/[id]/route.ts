import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Toggle active.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  const { active } = await request.json().catch(() => ({}));
  try {
    const listing = await prisma.sponsoredListing.update({
      where: { id },
      data: { active: !!active },
    });
    return Response.json({ listing });
  } catch {
    return Response.json({ message: "Not found." }, { status: 404 });
  }
}

// Delete.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  try {
    await prisma.sponsoredListing.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: "Not found." }, { status: 404 });
  }
}
