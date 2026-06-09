import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin: plans whose commission needs approval (default) or all.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  const all = new URL(request.url).searchParams.get("all") === "1";
  const plans = await prisma.insurancePlan.findMany({
    where: all ? {} : { commission_approved: false },
    orderBy: { created_at: "desc" },
    include: { company: { select: { name: true } } },
  });
  return Response.json({ plans });
}
