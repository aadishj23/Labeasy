import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authData = await verifyAuth();
  if (!authData || authData.type !== "lab") return unauthorized();

  const { id } = await params;
  const { test_price } = await request.json().catch(() => ({}));

  const price = Number(test_price);
  if (!Number.isFinite(price) || price <= 0) {
    return Response.json({ message: "Enter a valid price." }, { status: 400 });
  }

  try {
    const labtest = await prisma.labTest.update({
      where: { lab_id_test_id: { lab_id: authData.labID as string, test_id: id } },
      data: { test_price: String(Math.round(price)) },
    });

    return Response.json(
      { message: "Price updated", labtest },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /updatelabtest route:", error);
    return Response.json({ message: "An error occurred" }, { status: 500 });
  }
}
