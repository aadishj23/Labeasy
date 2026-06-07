import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signinSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();

  const signinData = signinSchema.safeParse(body);
  if (!signinData.success) {
    return Response.json(
      { message: "Please enter a valid email and password." },
      { status: 400 }
    );
  }

  const { email, password } = body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Unified message for "not found" and "wrong password" (avoids leaking which
  // emails are registered).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!process.env.JWT_SECRET) {
    return Response.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  await createSession({ type: "user", userid: user.id, name: user.name });
  return Response.json({ type: "user", name: user.name }, { status: 200 });
}
