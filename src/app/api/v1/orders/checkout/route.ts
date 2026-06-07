import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";

const DISCOUNT_RATE = 0.2; // 20% off, matching the storefront pricing

export async function POST(request: Request) {
  const authData = await verifyAuth();
  if (!authData) return unauthorized();
  if (authData.type !== "user") {
    return Response.json(
      { message: "Only patients can book tests." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { labId, testIds, collectionType, scheduledAt } = body;

    if (!labId || !Array.isArray(testIds) || testIds.length === 0) {
      return Response.json(
        { message: "labId and at least one test are required." },
        { status: 400 }
      );
    }

    // Recompute prices from the DB — never trust client-sent amounts.
    const labTests = await prisma.labTest.findMany({
      where: { lab_id: labId, test_id: { in: testIds } },
    });
    if (labTests.length === 0) {
      return Response.json(
        { message: "These tests are no longer available at this lab." },
        { status: 400 }
      );
    }

    const subtotal = labTests.reduce(
      (sum, lt) => sum + Math.round(Number(lt.test_price) * 100),
      0
    );
    const discount = Math.round(subtotal * DISCOUNT_RATE);
    const total = subtotal - discount;

    if (total <= 0) {
      return Response.json({ message: "Invalid order total." }, { status: 400 });
    }

    // Razorpay order
    const rzpOrder = await getRazorpay().orders.create({
      amount: total,
      currency: "INR",
      receipt: `ord_${Date.now()}`,
      notes: { labId, userId: authData.userID ?? "" },
    });

    // Persist our order + items + pending payment
    const order = await prisma.order.create({
      data: {
        user_id: authData.userID as string,
        lab_id: labId,
        status: "PLACED",
        collection_type: collectionType === "HOME" ? "HOME" : "LAB_VISIT",
        scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
        subtotal,
        discount,
        total,
        items: {
          create: labTests.map((lt) => ({
            test_id: lt.test_id,
            test_name: lt.test_name,
            price: Math.round(Number(lt.test_price) * 100),
          })),
        },
        payment: {
          create: {
            provider: "razorpay",
            provider_order_id: rzpOrder.id,
            amount: total,
            status: "CREATED",
          },
        },
      },
    });

    return Response.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: total,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error in /orders/checkout route:", error);
    return Response.json(
      { message: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
