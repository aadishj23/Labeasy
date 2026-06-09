import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

async function ownPlan(id: string, companyId: string) {
  const plan = await prisma.insurancePlan.findUnique({ where: { id } });
  return plan && plan.company_id === companyId ? plan : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const { id } = await params;
  const plan = await ownPlan(id, auth.insuranceID as string);
  if (!plan) return Response.json({ message: "Plan not found." }, { status: 404 });

  const b = await request.json().catch(() => ({}));
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name).trim();
  if (b.description !== undefined) data.description = String(b.description).trim();
  if (typeof b.active === "boolean") data.active = b.active;
  if (b.price !== undefined) {
    const p = Number(b.price);
    if (!Number.isFinite(p) || p <= 0) {
      return Response.json({ message: "Invalid price." }, { status: 400 });
    }
    data.price = Math.round(p * 100);
  }
  if (b.commission_pct !== undefined) {
    const c = Math.max(0, Math.min(100, Math.round(Number(b.commission_pct) || 0)));
    if (c !== plan.commission_pct) {
      data.commission_pct = c;
      data.commission_approved = false; // changing commission needs re-approval
    }
  }

  const updated = await prisma.insurancePlan.update({ where: { id }, data });
  return Response.json({ plan: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const { id } = await params;
  const plan = await ownPlan(id, auth.insuranceID as string);
  if (!plan) return Response.json({ message: "Plan not found." }, { status: 404 });
  await prisma.insurancePlan.delete({ where: { id } });
  return Response.json({ ok: true });
}
