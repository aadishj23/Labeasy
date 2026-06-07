import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { getRazorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { priceGroup } from "@/lib/pricing";
import { validateCoupon } from "@/lib/coupons";

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
    const { labId, collectionType, scheduledAt, addressId, couponCode } = body;
    const testIds: string[] = Array.isArray(body.testIds) ? body.testIds : [];
    const packageIds: string[] = Array.isArray(body.packageIds)
      ? body.packageIds
      : [];

    if (!labId || (testIds.length === 0 && packageIds.length === 0)) {
      return Response.json(
        { message: "labId and at least one item are required." },
        { status: 400 }
      );
    }

    // Address is compulsory for home collection.
    const isHome = collectionType === "HOME";
    let address_id: string | null = null;
    if (isHome) {
      if (!addressId) {
        return Response.json(
          { message: "Please select a home-collection address." },
          { status: 400 }
        );
      }
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (!addr || addr.user_id !== authData.userID) {
        return Response.json(
          { message: "That address could not be found." },
          { status: 400 }
        );
      }
      address_id = addr.id;
    }

    // Recompute prices from the DB — never trust client-sent amounts.
    const { labTests, packages, subtotal, storefrontDiscount, payable } =
      await priceGroup(labId, testIds, packageIds);

    if (labTests.length === 0 && packages.length === 0) {
      return Response.json(
        { message: "These items are no longer available at this lab." },
        { status: 400 }
      );
    }

    // Optional lab-scoped coupon (re-validated server-side).
    let couponDiscount = 0;
    let coupon_id: string | null = null;
    if (couponCode) {
      const result = await validateCoupon({
        labId,
        code: couponCode,
        subtotal,
        payable,
        userId: authData.userID,
      });
      if ("error" in result) {
        return Response.json({ message: result.error }, { status: 400 });
      }
      couponDiscount = result.discount;
      coupon_id = result.coupon!.id;
    }

    const discount = storefrontDiscount + couponDiscount;
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
        collection_type: isHome ? "HOME" : "LAB_VISIT",
        address_id,
        scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
        subtotal,
        discount,
        total,
        coupon_id,
        items: {
          create: [
            ...labTests.map((lt) => ({
              kind: "TEST",
              test_id: lt.test_id,
              test_name: lt.test_name,
              price: Math.round(Number(lt.test_price) * 100),
            })),
            ...packages.map((p) => ({
              kind: "PACKAGE",
              package_id: p.id,
              test_name: p.name,
              price: Math.round(p.price * 100),
            })),
          ],
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
