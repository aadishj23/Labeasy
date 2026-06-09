import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { postEntry } from "@/lib/wallet";

function vendor(auth: any) {
  if (auth?.type === "doctor") return { ownerType: "DOCTOR" as const, ownerId: auth.doctorID as string };
  if (auth?.type === "insurance") return { ownerType: "INSURANCE" as const, ownerId: auth.insuranceID as string };
  return null;
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  const v = vendor(auth);
  if (!v) return unauthorized();

  const { listingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await request.json().catch(() => ({}));
  if (!listingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json({ message: "Missing payment details." }, { status: 400 });
  }

  const listing = await prisma.sponsoredListing.findUnique({ where: { id: listingId } });
  if (
    !listing || listing.owner_id !== v.ownerId || listing.owner_type !== v.ownerType ||
    listing.provider_order_id !== razorpay_order_id
  ) {
    return Response.json({ message: "Placement not found." }, { status: 404 });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });
  if (!valid) {
    return Response.json({ message: "Payment verification failed." }, { status: 400 });
  }

  await prisma.sponsoredListing.update({
    where: { id: listingId },
    data: { active: true, provider_payment_id: razorpay_payment_id },
  });

  if (listing.wallet_applied > 0) {
    const refId = `spon:${listing.id}`;
    const exists = await prisma.walletEntry.findFirst({ where: { ref_id: refId } });
    if (!exists) {
      await postEntry({
        ownerType: v.ownerType,
        ownerId: v.ownerId,
        amount: -listing.wallet_applied,
        type: "SPONSORSHIP",
        description: "Featured placement",
        refId,
      });
    }
  }

  return Response.json({ ok: true });
}
