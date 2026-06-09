import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin: approve/revoke a plan's commission (gates sellability).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const data: any = {};
  if (typeof b.commission_approved === "boolean") data.commission_approved = b.commission_approved;
  const plan = await prisma.insurancePlan.update({ where: { id }, data });
  return Response.json({ plan });
}
