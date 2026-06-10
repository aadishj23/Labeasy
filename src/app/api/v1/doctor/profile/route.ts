import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { SPECIALTIES } from "@/lib/doctor-suggestions";

// Every profile field needs admin approval (like labs) — nothing applies instantly.

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

  // Collect every changed field into a pending change request (admin-approved).
  const changes: Record<string, any> = {};
  const str = (f: string) => {
    if (body[f] === undefined) return;
    const val = String(body[f]).trim();
    if (val && val !== (current as any)[f]) changes[f] = val;
  };
  ["name", "specialty", "clinic", "city", "phone", "description"].forEach(str);

  if (body.pincode !== undefined) {
    const pin = String(body.pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      return Response.json({ message: "Pincode must be 6 digits." }, { status: 400 });
    }
    if (pin !== current.pincode) changes.pincode = pin;
  }
  if (body.fee !== undefined) {
    const fee = Math.max(0, Math.round(Number(body.fee) || 0));
    if (fee !== current.fee) changes.fee = fee;
  }
  if (changes.specialty && !SPECIALTIES.includes(changes.specialty)) {
    return Response.json({ message: "Pick a valid specialty." }, { status: 400 });
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

  return Response.json({ ok: true, pending });
}
