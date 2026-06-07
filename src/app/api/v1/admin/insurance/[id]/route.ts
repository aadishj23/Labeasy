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
  if (b.logo_url !== undefined) data.logo_url = b.logo_url?.trim() || null;
  if (b.blurb !== undefined) data.blurb = b.blurb?.trim() || null;
  if (b.commission_note !== undefined)
    data.commission_note = b.commission_note?.trim() || null;
  if (b.referral_url !== undefined) {
    const url = String(b.referral_url).trim();
    try {
      new URL(url);
    } catch {
      return Response.json({ message: "Invalid referral URL." }, { status: 400 });
    }
    data.referral_url = url;
  }
  if (b.test_discount_pct !== undefined)
    data.test_discount_pct = Math.max(0, Math.min(100, Number(b.test_discount_pct) || 0));
  if (Array.isArray(b.plan_highlights))
    data.plan_highlights = b.plan_highlights.map((h: string) => h.trim()).filter(Boolean);

  const partner = await prisma.insurancePartner.update({ where: { id }, data });
  return Response.json({ partner });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();
  const { id } = await params;
  await prisma.insurancePartner.delete({ where: { id } });
  return Response.json({ ok: true });
}
