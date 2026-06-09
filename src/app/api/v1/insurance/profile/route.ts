import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Company name needs admin approval; description/logo apply instantly.
const SENSITIVE_FIELDS = ["name"] as const;

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();

  const company = await prisma.insuranceCompany.findUnique({
    where: { id: auth.insuranceID },
    select: { name: true, email: true, description: true, logo_url: true, status: true },
  });
  if (!company) return unauthorized();

  const pending = await prisma.profileChangeRequest.findFirst({
    where: { vendor_type: "INSURANCE", vendor_id: auth.insuranceID as string, status: "PENDING" },
    orderBy: { created_at: "desc" },
  });
  return Response.json({ company, pending });
}

export async function PATCH(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const body = await request.json().catch(() => ({}));

  const current = await prisma.insuranceCompany.findUnique({ where: { id: auth.insuranceID } });
  if (!current) return unauthorized();

  const directData: Record<string, unknown> = {};
  if (body.description !== undefined) directData.description = String(body.description).trim();
  if (body.logo_url !== undefined) directData.logo_url = String(body.logo_url).trim() || null;

  const changes: Record<string, string> = {};
  for (const f of SENSITIVE_FIELDS) {
    if (body[f] !== undefined) {
      const val = String(body[f]).trim();
      if (val && val !== (current as any)[f]) changes[f] = val;
    }
  }

  if (Object.keys(directData).length) {
    await prisma.insuranceCompany.update({ where: { id: auth.insuranceID }, data: directData });
  }

  let pending = null;
  if (Object.keys(changes).length) {
    const existing = await prisma.profileChangeRequest.findFirst({
      where: { vendor_type: "INSURANCE", vendor_id: auth.insuranceID as string, status: "PENDING" },
    });
    pending = existing
      ? await prisma.profileChangeRequest.update({ where: { id: existing.id }, data: { changes } })
      : await prisma.profileChangeRequest.create({
          data: { vendor_type: "INSURANCE", vendor_id: auth.insuranceID as string, changes },
        });
  }

  return Response.json({ ok: true, appliedFields: Object.keys(directData), pending });
}
