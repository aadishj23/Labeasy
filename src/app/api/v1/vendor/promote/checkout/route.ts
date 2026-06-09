import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { featuredPrice, SPONSOR_MONTHS } from "@/lib/sponsored-pricing";
import { ownerBalance, postEntry } from "@/lib/wallet";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { ownerType: "DOCTOR" as const, ownerId: auth.doctorID as string };
  if (auth?.type === "insurance") return { ownerType: "INSURANCE" as const, ownerId: auth.insuranceID as string };
  return null;
}

// Buy a featured placement; wallet balance first, online for the shortfall.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const months = Number((await request.json().catch(() => ({}))).months);
  if (!SPONSOR_MONTHS.includes(months)) {
    return Response.json({ message: "Invalid duration." }, { status: 400 });
  }

  const amount = featuredPrice(months) * 100;
  const balance = await ownerBalance(v.ownerType, v.ownerId);
  const fromWallet = Math.min(Math.max(0, balance), amount);
  const payOnline = amount - fromWallet;

  const now = new Date();
  const ends = new Date(now);
  ends.setMonth(ends.getMonth() + months);

  try {
    if (payOnline === 0) {
      const listing = await prisma.sponsoredListing.create({
        data: {
          owner_type: v.ownerType,
          owner_id: v.ownerId,
          scope: "FEATURED",
          amount,
          wallet_applied: fromWallet,
          starts_at: now,
          ends_at: ends,
          active: true,
        },
      });
      await postEntry({
        ownerType: v.ownerType,
        ownerId: v.ownerId,
        amount: -fromWallet,
        type: "SPONSORSHIP",
        description: "Featured placement",
        refId: `spon:${listing.id}`,
      });
      return Response.json({ covered: true });
    }

    const rzpOrder = await getRazorpay().orders.create({
      amount: payOnline,
      currency: "INR",
      receipt: `feat_${Date.now()}`,
      notes: { type: "featured", ownerType: v.ownerType, ownerId: v.ownerId },
    });
    const listing = await prisma.sponsoredListing.create({
      data: {
        owner_type: v.ownerType,
        owner_id: v.ownerId,
        scope: "FEATURED",
        amount,
        wallet_applied: fromWallet,
        starts_at: now,
        ends_at: ends,
        active: false,
        provider_order_id: rzpOrder.id,
      },
    });

    return Response.json({
      covered: false,
      listingId: listing.id,
      razorpayOrderId: rzpOrder.id,
      amount: payOnline,
      fromWallet,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (e) {
    console.error("Featured checkout failed:", e);
    return Response.json({ message: "Could not start checkout." }, { status: 500 });
  }
}
