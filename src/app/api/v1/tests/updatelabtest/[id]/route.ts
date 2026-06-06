import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function PUT(request, { params }) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  const { id } = await params;
  const body = await request.json();
  const labID = authData.labID ?? body.labID;
  const { test_price } = body;

  try {
    const labtest = await prisma.labTest.update({
      where: { lab_id_test_id: { lab_id: labID, test_id: id } },
      data: { test_price },
    });

    return Response.json(
      { message: "Lab test updated successfully", labtest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /updatelabtest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
