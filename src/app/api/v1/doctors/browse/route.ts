import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Public: approved, active doctors. Defaults to the signed-in patient's
// pincode (their default address) unless `all=1` or an explicit `pincode`.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const specialty = (searchParams.get("specialty") || "").trim();
  const available = searchParams.get("available") === "1";
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
  if (available) {
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
    },
  });
  return Response.json({ doctors, pincode: pincode || null, usedDefault });
}
