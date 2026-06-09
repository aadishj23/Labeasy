import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { featuredVendorIds } from "@/lib/sponsored";

// Public: approved, active doctors. Defaults to the signed-in patient's
// pincode (their default address) unless `all=1` or an explicit `pincode`.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const specialty = (searchParams.get("specialty") || "").trim();
  const time = (searchParams.get("time") || "").trim(); // morning | afternoon | evening
  const all = searchParams.get("all") === "1";
  let pincode = (searchParams.get("pincode") || "").trim();

  let usedDefault = false;
  if (!pincode && !all) {
    const auth = await verifyAuth().catch(() => null);
    if (auth?.type === "user") {
      const addr = await prisma.address.findFirst({
        where: { user_id: auth.userID as string },
        orderBy: [{ is_default: "desc" }, { id: "asc" }],
        select: { pincode: true },
      });
      if (addr?.pincode) {
        pincode = addr.pincode;
        usedDefault = true;
      }
    }
  }

  const where: any = { status: "APPROVED", active: true };
  if (pincode) where.pincode = pincode;
  if (specialty) where.specialty = specialty;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { specialty: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  // Preferred-time filter → require an upcoming open slot, then refine by IST window.
  const windows: Record<string, [number, number]> = {
    morning: [0, 12],
    afternoon: [12, 17],
    evening: [17, 24],
  };
  if (time && windows[time]) {
    where.slots = { some: { active: true, start_at: { gte: new Date() } } };
  }

  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: 60,
    select: {
      id: true, name: true, specialty: true, city: true, pincode: true,
      clinic: true, fee: true, description: true,
      rating_avg: true, rating_count: true,
      ...(time && windows[time]
        ? { slots: { where: { active: true, start_at: { gte: new Date() } }, select: { start_at: true } } }
        : {}),
    },
  });

  // IST hour of a slot (UTC + 5:30).
  const istHour = (iso: Date) => new Date(new Date(iso).getTime() + (5 * 60 + 30) * 60000).getUTCHours();

  let filtered = doctors;
  if (time && windows[time]) {
    const [lo, hi] = windows[time];
    filtered = doctors.filter((d: any) =>
      (d.slots || []).some((s: any) => {
        const h = istHour(s.start_at);
        return h >= lo && h < hi;
      })
    );
  }

  // Featured (paid) doctors first; drop the slots payload from the response.
  const featured = await featuredVendorIds("DOCTOR");
  const out = filtered
    .map(({ slots, ...d }: any) => ({ ...d, featured: featured.has(d.id) }))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return Response.json({ doctors: out, pincode: pincode || null, usedDefault });
}
