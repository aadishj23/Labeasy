import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
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
