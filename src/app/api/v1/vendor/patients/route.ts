import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ageFromDob } from "@/lib/vendor-patient";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { type: "DOCTOR", id: auth.doctorID as string };
  if (auth?.type === "lab") return { type: "LAB", id: auth.labID as string };
  return null;
}

export async function GET(request: Request) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  const where: any = { vendor_type: v.type, vendor_id: v.id };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }
  const rows = await prisma.vendorPatient.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: 200,
  });
  const patients = rows.map((p) => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    gender: p.gender,
    dob: p.dob,
    age: ageFromDob(p.dob),
    source: p.source,
    linked: !!p.user_id,
  }));
  return Response.json({ patients });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const b = await request.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  const phone = String(b.phone || "").trim();
  const gender = String(b.gender || "").trim().toUpperCase();
  const dob = b.dob ? new Date(b.dob) : null;

  if (!name) return Response.json({ message: "Name is required." }, { status: 400 });
  if (!/^\d{10}$/.test(phone)) {
    return Response.json({ message: "Enter a valid 10-digit phone." }, { status: 400 });
  }
  if (!["MALE", "FEMALE", "OTHER"].includes(gender)) {
    return Response.json({ message: "Select a gender." }, { status: 400 });
  }
  if (!dob || isNaN(dob.getTime()) || dob > new Date()) {
    return Response.json({ message: "Enter a valid date of birth." }, { status: 400 });
  }

  // Link to a Labeasy account with the same phone, if one exists.
  const user = await prisma.user.findUnique({ where: { phone }, select: { id: true } }).catch(() => null);

  const existing = await prisma.vendorPatient.findFirst({
    where: { vendor_type: v.type, vendor_id: v.id, phone },
  });

  const patient = existing
    ? await prisma.vendorPatient.update({
        where: { id: existing.id },
        data: { name, gender, dob, user_id: existing.user_id || user?.id || null },
      })
    : await prisma.vendorPatient.create({
        data: {
          vendor_type: v.type,
          vendor_id: v.id,
          name,
          phone,
          gender,
          dob,
          user_id: user?.id || null,
          source: "MANUAL",
        },
      });

  return Response.json({ patient });
}
