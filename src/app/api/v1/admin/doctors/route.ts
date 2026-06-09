import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin monitoring: all doctors (self-registered) with their approval status.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const doctors = await prisma.doctor.findMany({
    orderBy: { created_at: "desc" },
  });
  return Response.json({ doctors });
}
