import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { testSchema } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { test_name, test_description } = body;

    const parsedData = testSchema.safeParse(body);
    if (!parsedData.success) {
      return Response.json(parsedData.error, { status: 400 });
    }

    const test = await prisma.tests.create({
      data: { id: nanoid(), test_name, test_description },
    });

    return Response.json(
      { message: "Test created successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /addtest route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
