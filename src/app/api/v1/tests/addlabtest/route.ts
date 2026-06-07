import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function POST(request) {
  const authData = await verifyAuth();
  if (!authData) return unauthorized();

  const body = await request.json();
  // The auth middleware injects labID from the token for lab accounts.
  const labID = authData.labID ?? body.labID;
  const { test_name, test_price } = body;

  try {
    const test = await prisma.tests.findUnique({ where: { test_name } });
    const lab = await prisma.lab.findUnique({ where: { id: labID } });

    const labtest = await prisma.labTest.create({
      data: {
        lab_id: labID,
        lab_name: lab.lab_name,
        test_id: test.id,
        test_name: test.test_name,
        test_description: test.test_description,
        test_price,
      },
    });

    return Response.json(
      { message: "Lab test added successfully", labtest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /addlabtest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
