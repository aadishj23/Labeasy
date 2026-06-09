import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const leads = await prisma.insuranceLead.findMany({
    where: { company_id: auth.insuranceID as string },
    orderBy: { created_at: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
  return Response.json({ leads });
}
