import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api";
import { slugify } from "@/lib/slug";

// List the current lab's packages.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const packages = await prisma.package.findMany({
    where: { lab_id: auth.labID },
    orderBy: { created_at: "desc" },
    include: { items: { include: { test: { select: { test_name: true } } } } },
  });

  return Response.json({ packages });
}

// Create a package (bundle of the lab's tests at a combined price).
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const { name, description, price, mrp, category, testIds } = body;

  if (!name || !String(name).trim()) {
    return Response.json({ message: "Package name is required." }, { status: 400 });
  }
  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    return Response.json({ message: "Enter a valid price." }, { status: 400 });
  }
  if (!Array.isArray(testIds) || testIds.length < 2) {
    return Response.json(
      { message: "A package needs at least 2 tests." },
      { status: 400 }
    );
  }

  // Only allow tests this lab actually offers.
  const offered = await prisma.labTest.findMany({
    where: { lab_id: auth.labID, test_id: { in: testIds } },
    select: { test_id: true },
  });
  const validIds = offered.map((o) => o.test_id);
  if (validIds.length < 2) {
    return Response.json(
      { message: "Pick at least 2 tests your lab offers." },
      { status: 400 }
    );
  }

  try {
    const pkg = await prisma.package.create({
      data: {
        lab_id: auth.labID as string,
        name: String(name).trim(),
        slug: `${slugify(name)}-${nanoid(5).toLowerCase()}`,
        description: description || null,
        price: Math.round(Number(price)),
        mrp: mrp ? Math.round(Number(mrp)) : null,
        category: category || null,
        items: { create: validIds.map((test_id) => ({ test_id })) },
      },
      include: { items: true },
    });
    return Response.json({ package: pkg });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Could not create package." }, { status: 500 });
  }
}
