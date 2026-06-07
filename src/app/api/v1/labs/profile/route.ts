import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api";

// Fields a lab can change instantly vs. those needing admin approval.
const DIRECT_FIELDS = ["phone", "home_collection"] as const;
const SENSITIVE_FIELDS = [
  "lab_name",
  "owner_name",
  "address",
  "city",
  "state",
  "pincode",
  "license_no",
  "gst_no",
] as const;

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const lab = await prisma.lab.findUnique({
    where: { id: auth.labID },
    select: {
      lab_name: true,
      owner_name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      license_no: true,
      gst_no: true,
      home_collection: true,
      status: true,
    },
  });
  if (!lab) return unauthorized();

  const pending = await prisma.profileChangeRequest.findFirst({
    where: { lab_id: auth.labID, status: "PENDING" },
    orderBy: { created_at: "desc" },
  });

  return Response.json({ lab, pending });
}

export async function PATCH(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const body = await request.json().catch(() => ({}));

  const current = await prisma.lab.findUnique({ where: { id: auth.labID } });
  if (!current) return unauthorized();

  // Direct (self-service) fields
  const directData: Record<string, unknown> = {};
  if (body.phone !== undefined) {
    if (!/^\d{10}$/.test(String(body.phone))) {
      return Response.json(
        { message: "Phone must be a 10-digit number." },
        { status: 400 }
      );
    }
    directData.phone = String(body.phone);
  }
  if (body.home_collection !== undefined) {
    directData.home_collection = !!body.home_collection;
  }

  // Sensitive fields → collect only the ones that actually changed
  const changes: Record<string, string> = {};
  for (const f of SENSITIVE_FIELDS) {
    if (body[f] !== undefined) {
      const val = String(body[f]).trim();
      if (val && val !== (current as any)[f]) changes[f] = val;
    }
  }

  try {
    if (Object.keys(directData).length) {
      await prisma.lab.update({ where: { id: auth.labID }, data: directData });
    }

    let pending = null;
    if (Object.keys(changes).length) {
      const existing = await prisma.profileChangeRequest.findFirst({
        where: { lab_id: auth.labID, status: "PENDING" },
      });
      pending = existing
        ? await prisma.profileChangeRequest.update({
            where: { id: existing.id },
            data: { changes },
          })
        : await prisma.profileChangeRequest.create({
            data: { lab_id: auth.labID as string, changes },
          });
    }

    return Response.json({
      ok: true,
      appliedFields: Object.keys(directData),
      pending,
    });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Update failed." }, { status: 500 });
  }
}
