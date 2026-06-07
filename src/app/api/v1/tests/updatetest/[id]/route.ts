import prisma from "@/lib/prisma";
import { testSchema } from "@/lib/validation";
import { prismaErrorResponse, forbidden } from "@/lib/api";
import { verifyAdmin } from "@/lib/admin";

export async function PUT(request: Request, { params }) {
  if (!verifyAdmin(request)) return forbidden();
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
    const friendly = prismaErrorResponse(error);
    if (friendly) return friendly;
    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
