import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin: list profile change requests (default PENDING) across all vendor types,
// with the vendor's current values for comparison.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const status = new URL(request.url).searchParams.get("status") || "PENDING";
  const requests = await prisma.profileChangeRequest.findMany({
    where: { status },
    orderBy: { created_at: "desc" },
  });

  const idsByType = (t: string) =>
    requests.filter((r) => r.vendor_type === t).map((r) => r.vendor_id);

  const [labs, doctors, companies] = await Promise.all([
    prisma.lab.findMany({
      where: { id: { in: idsByType("LAB") } },
      select: {
        id: true, lab_name: true, owner_name: true, address: true, city: true,
        state: true, pincode: true, license_no: true, gst_no: true,
      },
    }),
    prisma.doctor.findMany({
      where: { id: { in: idsByType("DOCTOR") } },
      select: { id: true, name: true, specialty: true },
    }),
    prisma.insuranceCompany.findMany({
      where: { id: { in: idsByType("INSURANCE") } },
      select: { id: true, name: true },
    }),
  ]);

  const maps: Record<string, Record<string, any>> = {
    LAB: Object.fromEntries(labs.map((l) => [l.id, l])),
    DOCTOR: Object.fromEntries(doctors.map((d) => [d.id, d])),
    INSURANCE: Object.fromEntries(companies.map((c) => [c.id, c])),
  };

  const out = requests.map((r) => {
    const current = maps[r.vendor_type]?.[r.vendor_id] || null;
    const vendorName = current?.lab_name || current?.name || "—";
    return { ...r, vendorName, current };
  });

  return Response.json({ requests: out });
}
