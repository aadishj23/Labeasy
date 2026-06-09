import prisma from "@/lib/prisma";
import { featuredVendorIds } from "@/lib/sponsored";

// Public: sellable plans (approved company + active + commission approved).
export async function GET() {
  const companies = await prisma.insuranceCompany.findMany({
    where: { status: "APPROVED", active: true },
    select: {
      id: true,
      name: true,
      logo_url: true,
      plans: {
        where: { active: true, commission_approved: true },
        orderBy: { price: "asc" },
        select: { id: true, name: true, description: true, price: true },
      },
    },
  });

  const featured = await featuredVendorIds("INSURANCE");

  // Insurer ratings (computed on the fly — insurers have no cached column).
  const companyIds = companies.map((c) => c.id);
  const ratings = companyIds.length
    ? await prisma.review.groupBy({
        by: ["target_id"],
        where: { target_type: "INSURANCE", target_id: { in: companyIds }, status: "published" },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const ratingMap: Record<string, { avg: number; count: number }> = Object.fromEntries(
    ratings.map((r) => [
      r.target_id,
      { avg: Math.round((r._avg.rating || 0) * 10) / 10, count: r._count.rating },
    ])
  );

  const plans = companies
    .flatMap((c) =>
      c.plans.map((p) => ({
        ...p,
        companyId: c.id,
        companyName: c.name,
        companyLogo: c.logo_url,
        featured: featured.has(c.id),
        rating_avg: ratingMap[c.id]?.avg || 0,
        rating_count: ratingMap[c.id]?.count || 0,
      }))
    )
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return Response.json({ plans });
}
