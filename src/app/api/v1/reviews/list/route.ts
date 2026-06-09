import prisma from "@/lib/prisma";

// Public: published reviews for a target.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");
  if (!targetType || !targetId) return Response.json({ reviews: [] });

  const reviews = await prisma.review.findMany({
    where: { target_type: targetType, target_id: targetId, status: "published" },
    orderBy: { created_at: "desc" },
    take: 50,
    select: { reviewer_name: true, rating: true, comment: true, created_at: true },
  });
  return Response.json({ reviews });
}
