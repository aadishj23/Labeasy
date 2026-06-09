import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const orders = await prisma.order.findMany({
    // Only paid/confirmed orders — abandoned (PLACED, unpaid) ones never show.
    where: { user_id: auth.userID, status: { not: "PLACED" } },
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
