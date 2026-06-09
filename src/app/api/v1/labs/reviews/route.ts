import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();
  const [lab, reviews] = await Promise.all([
    prisma.lab.findUnique({ where: { id: auth.labID }, select: { rating_avg: true, rating_count: true } }),
    prisma.review.findMany({
      where: { target_type: "LAB", target_id: auth.labID as string, status: "published" },
      orderBy: { created_at: "desc" }, take: 100,
      select: { reviewer_name: true, rating: true, comment: true, created_at: true },
    }),
  ]);
  return Response.json({ reviews, rating_avg: lab?.rating_avg || 0, rating_count: lab?.rating_count || 0 });
}
