import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin: list labs (optionally by status) with their verification documents.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const status = new URL(request.url).searchParams.get("status");
  const where =
    status && ["PENDING", "VERIFIED", "SUSPENDED"].includes(status)
      ? { status: status as "PENDING" | "VERIFIED" | "SUSPENDED" }
      : {};

  const labs = await prisma.lab.findMany({
    where,
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      lab_name: true,
      owner_name: true,
      email: true,
      phone: true,
      city: true,
      state: true,
      license_no: true,
      gst_no: true,
      status: true,
      accreditations: true,
      created_at: true,
      documents: { orderBy: { created_at: "desc" } },
      _count: { select: { labTests: true } },
    },
  });

  return Response.json({ labs });
}
