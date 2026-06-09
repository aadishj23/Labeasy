import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ownerBalance } from "@/lib/wallet";
import { SPONSOR_MONTHLY, SPONSOR_MONTHS } from "@/lib/sponsored-pricing";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { ownerType: "DOCTOR" as const, ownerId: auth.doctorID as string };
  if (auth?.type === "insurance") return { ownerType: "INSURANCE" as const, ownerId: auth.insuranceID as string };
  return null;
}

// The vendor's current featured placements + wallet balance.
export async function GET() {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const [listings, balance] = await Promise.all([
    prisma.sponsoredListing.findMany({
      where: { owner_type: v.ownerType, owner_id: v.ownerId, active: true, scope: "FEATURED" },
      orderBy: { created_at: "desc" },
    }),
    ownerBalance(v.ownerType, v.ownerId),
  ]);

  return Response.json({
    listings,
    balance,
    monthlyPrice: SPONSOR_MONTHLY.FEATURED,
    months: SPONSOR_MONTHS,
  });
}
