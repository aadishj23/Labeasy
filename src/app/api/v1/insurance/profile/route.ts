import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Every profile field needs admin approval (like labs) — nothing applies instantly.
const SENSITIVE_FIELDS = ["name", "description", "logo_url"] as const;

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

  // Collect every changed field into a pending change request (admin-approved).
  const changes: Record<string, string> = {};
  for (const f of SENSITIVE_FIELDS) {
    if (body[f] !== undefined) {
      const val = String(body[f]).trim();
      if (val !== ((current as any)[f] || "")) changes[f] = val;
    }
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

  return Response.json({ ok: true, pending });
}
