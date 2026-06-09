import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin monitoring: all insurance companies (self-registered) + plan counts.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const companies = await prisma.insuranceCompany.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { plans: true, leads: true } },
      plans: {
        orderBy: { created_at: "desc" },
        select: {
          id: true, name: true, price: true, commission_pct: true,
          active: true, commission_approved: true,
        },
      },
    },
  });
  return Response.json({ companies });
}
