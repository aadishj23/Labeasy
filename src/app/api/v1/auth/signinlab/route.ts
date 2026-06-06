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
  const lab = await prisma.lab.findUnique({ where: { email } });

  if (!lab) {
    return new Response("Lab not found", { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, lab.password);
  if (!isPasswordValid) {
    return new Response("Invalid password", { status: 401 });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return new Response("JWT secret is not defined", { status: 500 });
  }

  const token = jwt.sign(
    { labid: lab?.id, type: "lab" },
    jwtSecret,
    { expiresIn: "10d" }
  );

  return Response.json({ token, type: "lab", labName: lab?.lab_name }, { status: 200 });
}
