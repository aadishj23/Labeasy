import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createAdminToken } from "@/lib/admin";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // Generic message — never reveal whether the email matched.
  const invalid = () =>
    Response.json({ message: "Invalid credentials." }, { status: 401 });

  if (!adminEmail || !email || email.toLowerCase().trim() !== adminEmail) {
    return invalid();
  }

  const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!admin || !password || !(await bcrypt.compare(password, admin.password))) {
    return invalid();
  }

  if (!process.env.JWT_SECRET) {
    return Response.json({ message: "Server configuration error." }, { status: 500 });
  }

  return Response.json({ token: createAdminToken(adminEmail) }, { status: 200 });
}
