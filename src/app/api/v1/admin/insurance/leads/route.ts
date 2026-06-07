import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const leads = await prisma.insuranceLead.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
    include: {
      partner: { select: { name: true, test_discount_pct: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const totalCommission = leads
    .filter((l) => l.status === "CONVERTED")
    .reduce((s, l) => s + l.commission, 0);

  return Response.json({ leads, totalCommission });
}
