import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { signinSchema } from "@/lib/validation";

export async function POST(request) {
  const body = await request.json();

  const signinData = signinSchema.safeParse(body);
  if (!signinData.success) {
    return Response.json(signinData.error, { status: 400 });
  }

  const { email, password } = body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return new Response("User not found", { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response("Invalid password", { status: 401 });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return new Response("JWT secret is not defined", { status: 500 });
  }

  const token = jwt.sign(
    { userid: user?.id, type: "user" },
    jwtSecret,
    { expiresIn: "10d" }
  );

  return Response.json({ token, type: "user", name: user?.name }, { status: 200 });
}
