import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const orders = await prisma.order.findMany({
    where: { user_id: auth.userID },
    orderBy: { created_at: "desc" },
    include: {
      items: true,
      lab: { select: { lab_name: true } },
      payment: { select: { status: true } },
      reports: { orderBy: { created_at: "asc" } },
    },
  });

  return Response.json({ orders });
}
