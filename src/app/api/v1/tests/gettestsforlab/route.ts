import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function POST(request) {
  const authData = verifyAuth(request);
  if (!authData) return unauthorized();

  const body = await request.json();
  const labID = authData.labID ?? body.labID;

  try {
    const tests = await prisma.labTest.findMany({ where: { lab_id: labID } });

    return Response.json(
      { message: "Tests fetched successfully", tests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /gettestsforlab route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
