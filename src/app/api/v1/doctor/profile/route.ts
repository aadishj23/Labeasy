import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { SPECIALTIES } from "@/lib/doctor-suggestions";

// Operational fields apply instantly; identity/credential fields need approval.
const SENSITIVE_FIELDS = ["name", "specialty"] as const;

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();

  const doctor = await prisma.doctor.findUnique({
    where: { id: auth.doctorID },
    select: {
      name: true, email: true, specialty: true, pincode: true, city: true,
      clinic: true, phone: true, fee: true, description: true, status: true,
    },
  });
  if (!doctor) return unauthorized();

  const pending = await prisma.profileChangeRequest.findFirst({
    where: { vendor_type: "DOCTOR", vendor_id: auth.doctorID as string, status: "PENDING" },
    orderBy: { created_at: "desc" },
  });
  return Response.json({ doctor, pending });
}

export async function PATCH(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const body = await request.json().catch(() => ({}));

  const current = await prisma.doctor.findUnique({ where: { id: auth.doctorID } });
  if (!current) return unauthorized();

  // Direct (self-service) fields.
  const directData: Record<string, unknown> = {};
  if (body.fee !== undefined) directData.fee = Math.max(0, Math.round(Number(body.fee) || 0));
  if (body.description !== undefined) directData.description = String(body.description).trim();
  if (body.clinic !== undefined) directData.clinic = String(body.clinic).trim();
  if (body.city !== undefined) directData.city = String(body.city).trim();
  if (body.phone !== undefined) directData.phone = String(body.phone).trim();
  if (body.pincode !== undefined) {
    const pin = String(body.pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      return Response.json({ message: "Pincode must be 6 digits." }, { status: 400 });
    }
    directData.pincode = pin;
  }

  // Sensitive fields → admin approval.
  const changes: Record<string, string> = {};
  for (const f of SENSITIVE_FIELDS) {
    if (body[f] !== undefined) {
      const val = String(body[f]).trim();
      if (val && val !== (current as any)[f]) changes[f] = val;
    }
  }
  if (changes.specialty && !SPECIALTIES.includes(changes.specialty)) {
    return Response.json({ message: "Pick a valid specialty." }, { status: 400 });
  }

  if (Object.keys(directData).length) {
    await prisma.doctor.update({ where: { id: auth.doctorID }, data: directData });
  }

  let pending = null;
  if (Object.keys(changes).length) {
    const existing = await prisma.profileChangeRequest.findFirst({
      where: { vendor_type: "DOCTOR", vendor_id: auth.doctorID as string, status: "PENDING" },
    });
    pending = existing
      ? await prisma.profileChangeRequest.update({ where: { id: existing.id }, data: { changes } })
      : await prisma.profileChangeRequest.create({
          data: { vendor_type: "DOCTOR", vendor_id: auth.doctorID as string, changes },
        });
  }

  return Response.json({ ok: true, appliedFields: Object.keys(directData), pending });
}
