import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { recomputeRating } from "@/lib/reviews";

// The patient's own review for one target (?targetType=&targetId=) or all theirs.
export async function GET(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (targetType && targetId) {
    const review = await prisma.review.findUnique({
      where: {
        user_id_target_type_target_id: {
          user_id: auth.userID as string,
          target_type: targetType,
          target_id: targetId,
        },
      },
      select: { rating: true, comment: true },
    });
    return Response.json({ review });
  }

  const reviews = await prisma.review.findMany({
    where: { user_id: auth.userID },
    select: { target_type: true, target_id: true, rating: true, comment: true },
  });
  return Response.json({ reviews });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { targetType, targetId, refId, rating, comment } = await request
    .json()
    .catch(() => ({}));

  if (
    !["LAB", "DOCTOR", "INSURANCE"].includes(targetType) ||
    !targetId ||
    !rating ||
    rating < 1 ||
    rating > 5
  ) {
    return Response.json(
      { message: "A valid target and rating (1–5) are required." },
      { status: 400 }
    );
  }

  // Booking-gated: must have transacted with the target.
  if (targetType === "LAB") {
    const order = await prisma.order.findFirst({
      where: {
        ...(refId ? { id: refId } : {}),
        user_id: auth.userID,
        lab_id: targetId,
        NOT: { status: "PLACED" },
      },
    });
    if (!order) {
      return Response.json(
        { message: "You can review a lab only after a booking with it." },
        { status: 403 }
      );
    }
  } else if (targetType === "DOCTOR") {
    const appt = await prisma.appointment.findFirst({
      where: { user_id: auth.userID, doctor_id: targetId, status: "COMPLETED" },
    });
    if (!appt) {
      return Response.json(
        { message: "You can review a doctor only after a completed consultation." },
        { status: 403 }
      );
    }
  } else {
    const policy = await prisma.policyPurchase.findFirst({
      where: { user_id: auth.userID, company_id: targetId, status: "CONFIRMED" },
    });
    if (!policy) {
      return Response.json(
        { message: "You can review an insurer only after buying a plan." },
        { status: 403 }
      );
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userID },
    select: { name: true },
  });

  await prisma.review.upsert({
    where: {
      user_id_target_type_target_id: {
        user_id: auth.userID as string,
        target_type: targetType,
        target_id: targetId,
      },
    },
    update: { rating, comment: comment || null, reviewer_name: user?.name },
    create: {
      user_id: auth.userID,
      target_type: targetType,
      target_id: targetId,
      order_id: targetType === "LAB" ? refId || null : null,
      rating,
      comment: comment || null,
      reviewer_name: user?.name,
    },
  });

  await recomputeRating(targetType, targetId);
  return Response.json({ ok: true });
}
