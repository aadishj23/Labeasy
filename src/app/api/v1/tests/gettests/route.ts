import prisma from "@/lib/prisma";

// Always run on the server at request time (never statically evaluated at build).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tests = await prisma.tests.findMany();
    return Response.json(
      { message: "Tests fetched successfully", tests },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /gettests route:", error);
    return Response.json({ message: "An error occurred", error }, { status: 500 });
  }
}
