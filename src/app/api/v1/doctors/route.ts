import prisma from "@/lib/prisma";

// Public: active doctors matching the given specialties (comma-separated),
// optionally preferring a city. Used for report-based recommendations.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialties = (searchParams.get("specialties") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = (searchParams.get("city") || "").trim();

  if (specialties.length === 0) {
    return Response.json({ doctors: [] });
  }

  const doctors = await prisma.doctor.findMany({
    where: { active: true, specialty: { in: specialties } },
    orderBy: { created_at: "desc" },
    take: 30,
  });

  // Prefer same-city doctors, but keep others as fallback.
  const sorted = city
    ? [...doctors].sort((a, b) => {
        const am = a.city?.toLowerCase() === city.toLowerCase() ? 0 : 1;
        const bm = b.city?.toLowerCase() === city.toLowerCase() ? 0 : 1;
        return am - bm;
      })
    : doctors;

  return Response.json({ doctors: sorted.slice(0, 6) });
}
