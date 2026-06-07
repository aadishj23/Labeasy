import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Patient's report inbox.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const reports = await prisma.report.findMany({
    where: { user_id: auth.userID },
    orderBy: { created_at: "desc" },
    include: {
      order: {
        select: {
          lab: { select: { lab_name: true } },
          items: { select: { test_name: true } },
        },
      },
    },
  });

  return Response.json({ reports });
}
