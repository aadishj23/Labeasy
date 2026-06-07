import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const doctors = await prisma.doctor.findMany({
    orderBy: { created_at: "desc" },
  });
  return Response.json({ doctors });
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const b = await request.json().catch(() => ({}));
  const name = (b.name || "").trim();
  const specialty = (b.specialty || "").trim();
  const pincode = (b.pincode || "").trim();
  if (!name || !specialty || !pincode) {
    return Response.json(
      { message: "Name, specialty and pincode are required." },
      { status: 400 }
    );
  }
  if (!/^\d{6}$/.test(pincode)) {
    return Response.json(
      { message: "Pincode must be 6 digits." },
      { status: 400 }
    );
  }
  const doctor = await prisma.doctor.create({
    data: {
      name,
      specialty,
      pincode,
      city: b.city?.trim() || null,
      clinic: b.clinic?.trim() || null,
      phone: b.phone?.trim() || null,
      consult_url: b.consult_url?.trim() || null,
      blurb: b.blurb?.trim() || null,
      fee: b.fee ? Math.max(0, Number(b.fee)) : null,
      active: b.active !== false,
    },
  });
  return Response.json({ doctor });
}
