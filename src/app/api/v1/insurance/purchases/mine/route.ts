import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const purchases = await prisma.policyPurchase.findMany({
    where: { user_id: auth.userID as string, status: "CONFIRMED" },
    orderBy: { created_at: "desc" },
    include: { plan: { select: { name: true } }, company: { select: { id: true, name: true } } },
  });
  return Response.json({ purchases });
}
