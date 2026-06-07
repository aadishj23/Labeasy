import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  // Only paid/confirmed orders are surfaced to labs (not unpaid PLACED ones).
  const orders = await prisma.order.findMany({
    where: { lab_id: auth.labID, NOT: { status: "PLACED" } },
    orderBy: { created_at: "desc" },
    include: {
      items: true,
      user: { select: { name: true, phone: true, email: true } },
    },
  });

  return Response.json({ orders });
}
