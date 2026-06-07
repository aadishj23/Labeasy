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
  const lab = await prisma.lab.findUnique({ where: { email } });

  if (!lab || !(await bcrypt.compare(password, lab.password))) {
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

  await createSession({ type: "lab", labid: lab.id, name: lab.lab_name });
  return Response.json({ type: "lab", name: lab.lab_name }, { status: 200 });
}
