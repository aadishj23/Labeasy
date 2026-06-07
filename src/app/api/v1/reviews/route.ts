import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { recomputeLabRating } from "@/lib/reviews";

// Fetch the current patient's review for a given lab (for edit-mode pre-fill).
export async function GET(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const labId = new URL(request.url).searchParams.get("labId");
  if (!labId) return Response.json({ review: null });

  const review = await prisma.review.findUnique({
    where: {
      user_id_lab_id: { user_id: auth.userID as string, lab_id: labId },
    },
    select: { rating: true, comment: true },
  });

  return Response.json({ review });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { labId, orderId, rating, comment } = await request
    .json()
    .catch(() => ({}));

  if (!labId || !orderId || !rating || rating < 1 || rating > 5) {
    return Response.json(
      { message: "A booking and a rating (1–5) are required." },
      { status: 400 }
    );
  }

  // Order-gated: the order must belong to this patient + lab and be paid.
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      user_id: auth.userID,
      lab_id: labId,
      NOT: { status: "PLACED" },
    },
  });
  if (!order) {
    return Response.json(
      { message: "You can review a lab only after a booking with it." },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userID },
    select: { name: true },
  });

  // One review per patient per lab — upsert by (user_id, lab_id); editable later.
  await prisma.review.upsert({
    where: {
      user_id_lab_id: {
        user_id: auth.userID as string,
        lab_id: labId,
      },
    },
    update: { rating, comment: comment || null, order_id: orderId, reviewer_name: user?.name },
    create: {
      user_id: auth.userID,
      lab_id: labId,
      order_id: orderId,
      rating,
      comment: comment || null,
      reviewer_name: user?.name,
    },
  });

  await recomputeLabRating(labId);

  return Response.json({ ok: true });
}
