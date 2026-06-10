import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ageFromDob } from "@/lib/vendor-patient";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { type: "DOCTOR", id: auth.doctorID as string };
  if (auth?.type === "lab") return { type: "LAB", id: auth.labID as string };
  return null;
}

async function own(v: { type: string; id: string }, id: string) {
  const p = await prisma.vendorPatient.findUnique({ where: { id } });
  return p && p.vendor_type === v.type && p.vendor_id === v.id ? p : null;
}

// Profile + this vendor's booking history for the patient.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const { id } = await params;
  const p = await own(v, id);
  if (!p) return Response.json({ message: "Patient not found." }, { status: 404 });

  let history: any[] = [];
  if (v.type === "DOCTOR") {
    const or: any[] = [{ patient_phone: p.phone }];
    if (p.user_id) or.push({ user_id: p.user_id });
    const appts = await prisma.appointment.findMany({
      where: { doctor_id: v.id, status: { not: "PLACED" }, OR: or },
      orderBy: { scheduled_at: "desc" },
      select: { id: true, scheduled_at: true, status: true, fee: true, paid_status: true, source: true },
    });
    history = appts.map((a) => ({
      kind: "APPOINTMENT",
      date: a.scheduled_at,
      status: a.status,
      amount: a.fee,
      paid_status: a.paid_status,
      source: a.source,
    }));
  } else if (v.type === "LAB") {
    const or: any[] = [{ patient_phone: p.phone }];
    if (p.user_id) or.push({ user_id: p.user_id });
    const orders = await prisma.order.findMany({
      where: { lab_id: v.id, status: { not: "PLACED" }, OR: or },
      orderBy: { created_at: "desc" },
      include: { items: { select: { test_name: true } } },
    });
    history = orders.map((o) => ({
      kind: "ORDER",
      date: o.created_at,
      status: o.status,
      amount: o.total,
      paid_status: o.paid_status,
      source: o.source,
      tests: o.items.map((i) => i.test_name),
    }));
  }

  return Response.json({
    patient: {
      id: p.id, name: p.name, phone: p.phone, gender: p.gender,
      dob: p.dob, age: ageFromDob(p.dob), source: p.source, linked: !!p.user_id,
    },
    history,
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const { id } = await params;
  if (!(await own(v, id))) return Response.json({ message: "Patient not found." }, { status: 404 });

  const b = await request.json().catch(() => ({}));
  const data: any = {};
  if (b.name !== undefined) data.name = String(b.name).trim();
  if (b.gender !== undefined) {
    const g = String(b.gender).trim().toUpperCase();
    if (!["MALE", "FEMALE", "OTHER"].includes(g)) {
      return Response.json({ message: "Invalid gender." }, { status: 400 });
    }
    data.gender = g;
  }
  if (b.dob !== undefined) {
    const dob = b.dob ? new Date(b.dob) : null;
    if (!dob || isNaN(dob.getTime()) || dob > new Date()) {
      return Response.json({ message: "Invalid date of birth." }, { status: 400 });
    }
    data.dob = dob;
  }

  try {
    const patient = await prisma.vendorPatient.update({ where: { id }, data });
    return Response.json({ patient });
  } catch {
    return Response.json({ message: "Could not update patient." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();
  const { id } = await params;
  if (!(await own(v, id))) return Response.json({ message: "Patient not found." }, { status: 404 });
  await prisma.vendorPatient.delete({ where: { id } });
  return Response.json({ ok: true });
}
