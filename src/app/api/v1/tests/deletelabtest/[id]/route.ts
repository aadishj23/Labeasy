import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const labID = authData.labID ?? body.labID;

  try {
    const labtest = await prisma.labTest.delete({
      where: { lab_id_test_id: { lab_id: labID, test_id: id } },
    });

    return Response.json(
      { message: "Lab test deleted successfully", labtest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /deletelabtest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
