import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// A lab books an offline test order for a catalogue patient.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { patientId, testIds, paid_status, amount_paid } = await request
    .json()
    .catch(() => ({}));

  if (!patientId) return Response.json({ message: "Patient is required." }, { status: 400 });
  if (!Array.isArray(testIds) || testIds.length === 0) {
    return Response.json({ message: "Pick at least one test." }, { status: 400 });
  }
  if (!["PAID", "UNPAID", "PARTIAL"].includes(paid_status)) {
    return Response.json({ message: "Select a payment status." }, { status: 400 });
  }

  const patient = await prisma.vendorPatient.findUnique({ where: { id: patientId } });
  if (!patient || patient.vendor_type !== "LAB" || patient.vendor_id !== auth.labID) {
    return Response.json({ message: "Patient not found." }, { status: 404 });
  }

  const labTests = await prisma.labTest.findMany({
    where: { lab_id: auth.labID as string, test_id: { in: testIds } },
    select: { test_id: true, test_name: true, test_price: true },
  });
  if (labTests.length === 0) {
    return Response.json({ message: "Pick tests your lab offers." }, { status: 400 });
  }

  const total = labTests.reduce((s, t) => s + Math.round((Number(t.test_price) || 0) * 100), 0);
  const paid =
    paid_status === "PAID"
      ? total
      : paid_status === "PARTIAL"
        ? Math.max(0, Math.min(total, Math.round((Number(amount_paid) || 0) * 100)))
        : 0;

  const order = await prisma.order.create({
    data: {
      lab_id: auth.labID as string,
      user_id: null, // off-platform; tracked by patient_phone
      source: "MANUAL",
      status: "CONFIRMED",
      collection_type: "LAB_VISIT",
      subtotal: total,
      total,
      patient_name: patient.name,
      patient_phone: patient.phone,
      paid_status,
      amount_paid: paid,
      items: {
        create: labTests.map((t) => ({
          kind: "TEST",
          test_id: t.test_id,
          test_name: t.test_name,
          price: Math.round((Number(t.test_price) || 0) * 100),
        })),
      },
    },
  });

  return Response.json({ ok: true, orderId: order.id });
}
