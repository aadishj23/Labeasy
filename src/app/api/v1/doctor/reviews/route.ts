import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const [doctor, reviews] = await Promise.all([
    prisma.doctor.findUnique({ where: { id: auth.doctorID }, select: { rating_avg: true, rating_count: true } }),
    prisma.review.findMany({
      where: { target_type: "DOCTOR", target_id: auth.doctorID as string, status: "published" },
      orderBy: { created_at: "desc" }, take: 100,
      select: { reviewer_name: true, rating: true, comment: true, created_at: true },
    }),
  ]);
  return Response.json({ reviews, rating_avg: doctor?.rating_avg || 0, rating_count: doctor?.rating_count || 0 });
}
