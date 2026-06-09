import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const purchases = await prisma.policyPurchase.findMany({
    where: { company_id: auth.insuranceID as string, status: "CONFIRMED" },
    orderBy: { created_at: "desc" },
    include: { plan: { select: { name: true } }, user: { select: { name: true } } },
  });
  return Response.json({ purchases });
}
