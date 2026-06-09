import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { postEntry } from "@/lib/wallet";

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const { listingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await request.json().catch(() => ({}));

  if (!listingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ message: "Missing payment details." }, { status: 400 });
  }

  const listing = await prisma.sponsoredListing.findUnique({
    where: { id: listingId },
  });
  if (
    !listing ||
    listing.owner_id !== auth.labID ||
    listing.provider_order_id !== razorpay_order_id
  ) {
    return Response.json({ message: "Sponsorship not found." }, { status: 404 });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return Response.json(
      { message: "Payment verification failed." },
      { status: 400 }
    );
  }

  await prisma.sponsoredListing.update({
    where: { id: listingId },
    data: { active: true, provider_payment_id: razorpay_payment_id },
  });

  // Debit the wallet portion that was applied (online portion is external).
  if (listing.wallet_applied > 0) {
    const refId = `spon:${listing.id}`;
    const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
    if (!exists) {
      await postEntry({
        ownerType: "LAB",
        ownerId: listing.owner_id,
        amount: -listing.wallet_applied,
        type: "SPONSORSHIP",
        description: `Sponsorship — ${listing.scope.toLowerCase()}`,
        refId,
      });
    }
  }

  return Response.json({ ok: true });
}
