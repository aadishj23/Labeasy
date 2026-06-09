import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { postEntry } from "@/lib/wallet";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  if (!["CLICKED", "CONVERTED", "REJECTED"].includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }
  const lead = await prisma.insuranceLead.findUnique({ where: { id } });
  if (!lead || lead.company_id !== auth.insuranceID) {
    return Response.json({ message: "Lead not found." }, { status: 404 });
  }

  await prisma.insuranceLead.update({
    where: { id },
    data: { status, converted_at: status === "CONVERTED" ? new Date() : null },
  });

  // A manual (off-platform) conversion still owes Labeasy its referral
  // commission — debit the insurer's wallet (idempotent per lead).
  const plan = lead.plan_id
    ? await prisma.insurancePlan.findUnique({
        where: { id: lead.plan_id },
        select: { price: true, commission_pct: true },
      })
    : null;
  if (status === "CONVERTED" && plan) {
    const commission = Math.round((plan.price * plan.commission_pct) / 100);
    if (commission > 0) {
      const refId = `lead:${lead.id}`;
      const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
      if (!exists) {
        await postEntry({
          ownerType: "INSURANCE",
          ownerId: lead.company_id,
          amount: -commission,
          type: "COMMISSION",
          description: "Referral commission (off-platform conversion)",
          refId,
        });
      }
    }
  }

  return Response.json({ ok: true });
}
