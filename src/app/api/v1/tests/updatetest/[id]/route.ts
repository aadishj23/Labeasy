import prisma from "@/lib/prisma";
import { testSchema } from "@/lib/validation";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { test_name, test_description } = body;

    const parsedData = testSchema.safeParse(body);
    if (!parsedData.success) {
      return Response.json(parsedData.error, { status: 400 });
    }

    const test = await prisma.tests.update({
      where: { id },
      data: { test_name, test_description },
    });

    await prisma.labTest.updateMany({
      where: { test_id: id },
      data: { test_name, test_description },
    });

    return Response.json(
      { message: "Test updated successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /updatetest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
