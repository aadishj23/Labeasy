import prisma from "@/lib/prisma";

export async function POST(request) {
  const { test_name } = await request.json();

  try {
    const test = await prisma.tests.findUnique({ where: { test_name } });
    const labs = await prisma.labTest.findMany({ where: { test_id: test.id } });

    return Response.json(
      { message: "Labs fetched successfully", labs },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /getlabsfortest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
