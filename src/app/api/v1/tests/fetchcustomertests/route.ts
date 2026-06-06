import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET(request) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const labId = searchParams.get("labId");

    if (!labId) {
      return Response.json({ error: "Lab ID is required" }, { status: 400 });
    }

    const customerTests = await prisma.userTest.findMany({
      where: { lab_id: labId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        test: { select: { id: true, test_name: true, test_description: true } },
        lab: { select: { id: true, lab_name: true } },
      },
    });

    return Response.json(customerTests, { status: 200 });
  } catch (error) {
    console.error("Error fetching customer tests:", error);
    return Response.json(
      { error: "An error occurred while fetching customer tests" },
      { status: 500 }
    );
  }
}
