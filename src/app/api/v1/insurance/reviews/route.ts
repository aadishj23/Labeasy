import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const reviews = await prisma.review.findMany({
    where: { target_type: "INSURANCE", target_id: auth.insuranceID as string, status: "published" },
    orderBy: { created_at: "desc" }, take: 100,
    select: { reviewer_name: true, rating: true, comment: true, created_at: true },
  });
  const rating_count = reviews.length;
  const rating_avg = rating_count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / rating_count) * 10) / 10 : 0;
  return Response.json({ reviews, rating_avg, rating_count });
}
