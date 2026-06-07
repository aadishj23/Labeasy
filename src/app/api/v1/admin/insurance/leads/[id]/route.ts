import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Update a lead's status / commission. Marking CONVERTED activates the user's
// insured discount (using the partner's test_discount_pct).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const status = b.status as string | undefined;

  if (status && !["CLICKED", "CONVERTED", "REJECTED"].includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }

  const lead = await prisma.insuranceLead.findUnique({
    where: { id },
    include: { partner: { select: { test_discount_pct: true } } },
  });
  if (!lead) {
    return Response.json({ message: "Lead not found." }, { status: 404 });
  }

  const data: any = {};
  if (status) data.status = status;
  if (b.commission !== undefined)
    data.commission = Math.max(0, Math.round(Number(b.commission) * 100)); // rupees -> paise
  if (status === "CONVERTED") data.converted_at = new Date();

  const updated = await prisma.insuranceLead.update({ where: { id }, data });

  // Grant / revoke the insured discount on the referred user.
  if (lead.user_id && status) {
    if (status === "CONVERTED") {
      await prisma.user.update({
        where: { id: lead.user_id },
        data: {
          insured: true,
          insurance_discount_pct: lead.partner.test_discount_pct,
        },
      });
    } else if (status === "REJECTED") {
      await prisma.user.update({
        where: { id: lead.user_id },
        data: { insured: false, insurance_discount_pct: 0 },
      });
    }
  }

  return Response.json({ lead: updated });
}
