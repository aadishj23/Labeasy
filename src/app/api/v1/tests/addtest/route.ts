import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { testSchema } from "@/lib/validation";
import { prismaErrorResponse, forbidden } from "@/lib/api";
import { verifyAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();
  try {
    const body = await request.json();
    const { test_name, test_description } = body;

    const parsedData = testSchema.safeParse(body);
    if (!parsedData.success) {
      return Response.json(parsedData.error, { status: 400 });
    }

    const test = await prisma.tests.create({
      data: {
        id: nanoid(),
        test_name,
        test_description,
        slug: slugify(test_name),
      },
    });

    return Response.json(
      { message: "Test created successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /addtest route:", error);
    const friendly = prismaErrorResponse(error);
    if (friendly) return friendly;
    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
