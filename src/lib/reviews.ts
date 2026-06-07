import prisma from "@/lib/prisma";

/** Recompute a lab's cached rating aggregate from its published reviews. */
export async function recomputeLabRating(labId: string) {
  const agg = await prisma.review.aggregate({
    where: { lab_id: labId, status: "published" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.lab.update({
    where: { id: labId },
    data: {
      rating_avg: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
      rating_count: agg._count.rating,
    },
  });
}
