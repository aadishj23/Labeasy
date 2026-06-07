import prisma from "@/lib/prisma";
import { forbidden } from "@/lib/api";
import { verifyAdmin } from "@/lib/admin";

export async function DELETE(request: Request, { params }) {
  if (!verifyAdmin(request)) return forbidden();
  try {
    const { id } = await params;
    const test = await prisma.tests.delete({ where: { id } });

    return Response.json(
      { message: "Test deleted successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /deletetest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
