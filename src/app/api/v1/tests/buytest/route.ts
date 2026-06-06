import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function POST(request) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  try {
    const { userId, labId, testId, testPrice } = await request.json();

    if (!userId || !labId || !testId || !testPrice) {
      return Response.json(
        { error: "userId, labId, testId, and testPrice are required" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.userTest.findUnique({
      where: {
        user_id_test_id_lab_id: {
          user_id: userId,
          test_id: testId,
          lab_id: labId,
        },
      },
    });

    if (existingOrder) {
      return Response.json(
        { error: "This test has already been purchased from this lab by the user" },
        { status: 400 }
      );
    }

    const userTest = await prisma.userTest.create({
      data: { user_id: userId, lab_id: labId, test_id: testId, test_price: testPrice },
    });

    return Response.json(
      { message: "Test purchased successfully", userTest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error purchasing test:", error);
    return Response.json(
      { error: "An error occurred while purchasing the test" },
      { status: 500 }
    );
  }
}
