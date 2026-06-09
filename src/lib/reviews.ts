import prisma from "@/lib/prisma";

/** Recompute a target's cached rating aggregate from its published reviews. */
export async function recomputeRating(
  targetType: "LAB" | "DOCTOR",
  targetId: string
) {
  const agg = await prisma.review.aggregate({
    where: { target_type: targetType, target_id: targetId, status: "published" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const data = {
    rating_avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    rating_count: agg._count.rating,
  };
  if (targetType === "LAB") {
    await prisma.lab.update({ where: { id: targetId }, data });
  } else {
    await prisma.doctor.update({ where: { id: targetId }, data });
  }
}
