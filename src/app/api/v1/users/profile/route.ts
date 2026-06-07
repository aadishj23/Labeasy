import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { prismaErrorResponse } from "@/lib/api";

// Current patient's profile + saved addresses.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: auth.userID },
    select: { name: true, email: true, phone: true, dob: true, gender: true },
  });
  if (!user) return unauthorized();

  const addresses = await prisma.address.findMany({
    where: { user_id: auth.userID },
    orderBy: [{ is_default: "desc" }, { id: "asc" }],
  });

  return Response.json({ user, addresses });
}

// Update basic profile fields.
export async function PATCH(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const { name, phone, dob, gender } = body;

  if (name !== undefined && (!name || String(name).trim().length < 2)) {
    return Response.json({ message: "Name is too short." }, { status: 400 });
  }
  if (phone !== undefined && !/^\d{10}$/.test(String(phone))) {
    return Response.json(
      { message: "Phone must be a 10-digit number." },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = String(name).trim();
  if (phone !== undefined) data.phone = String(phone);
  if (gender !== undefined) data.gender = gender || null;
  if (dob !== undefined) data.dob = dob ? new Date(dob) : null;

  try {
    const user = await prisma.user.update({
      where: { id: auth.userID },
      data,
      select: { name: true, email: true, phone: true, dob: true, gender: true },
    });
    return Response.json({ user });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Update failed." }, { status: 500 });
  }
}
