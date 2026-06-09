import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { sponsorPrice, SPONSOR_MONTHS } from "@/lib/sponsored-pricing";
import { labBalance, postEntry } from "@/lib/wallet";

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const scope = body.scope;
  const months = Number(body.months);
  const testIds: string[] = Array.isArray(body.testIds) ? body.testIds : [];

  if (!["EVERYWHERE", "DIRECTORY", "TESTS"].includes(scope)) {
    return Response.json({ message: "Invalid placement." }, { status: 400 });
  }
  if (!SPONSOR_MONTHS.includes(months)) {
    return Response.json({ message: "Invalid duration." }, { status: 400 });
  }

  let validTestIds: string[] = [];
  if (scope === "TESTS") {
    const offered = await prisma.labTest.findMany({
      where: { lab_id: auth.labID, test_id: { in: testIds } },
      select: { test_id: true },
    });
    validTestIds = offered.map((o) => o.test_id);
    if (validTestIds.length === 0) {
      return Response.json(
        { message: "Pick at least one of your tests to promote." },
        { status: 400 }
      );
    }
  }

  const amount = sponsorPrice({ scope, testCount: validTestIds.length, months }) * 100;
  if (amount <= 0) {
    return Response.json({ message: "Invalid amount." }, { status: 400 });
  }

  // Apply available wallet balance first; charge only the shortfall online.
  const balance = await labBalance(auth.labID as string);
  const fromWallet = Math.min(Math.max(0, balance), amount);
  const payOnline = amount - fromWallet;

  const now = new Date();
  const ends = new Date(now);
  ends.setMonth(ends.getMonth() + months);

  try {
    // Fully covered by wallet — activate immediately, no online payment.
    if (payOnline === 0) {
      const listing = await prisma.sponsoredListing.create({
        data: {
          owner_type: "LAB",
          owner_id: auth.labID as string,
          scope,
          test_ids: validTestIds,
          amount,
          wallet_applied: fromWallet,
          starts_at: now,
          ends_at: ends,
          active: true,
        },
      });
      await postEntry({
        ownerType: "LAB",
        ownerId: auth.labID as string,
        amount: -fromWallet,
        type: "SPONSORSHIP",
        description: `Sponsorship — ${scope.toLowerCase()}`,
        refId: `spon:${listing.id}`,
      });
      return Response.json({ covered: true });
    }

    // Needs an online payment for the remainder.
    const rzpOrder = await getRazorpay().orders.create({
      amount: payOnline,
      currency: "INR",
      receipt: `spon_${Date.now()}`,
      notes: { type: "sponsorship", labId: auth.labID ?? "" },
    });
    const listing = await prisma.sponsoredListing.create({
      data: {
        owner_type: "LAB",
        owner_id: auth.labID as string,
        scope,
        test_ids: validTestIds,
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
    console.error("Sponsorship checkout failed:", e);
    return Response.json(
      { message: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
