import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json(
      { message: "Please enter a valid email and password." },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.findUnique({
    where: { email: String(email).toLowerCase() },
  });
  if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
    return Response.json({ message: "Invalid email or password." }, { status: 401 });
  }

  await createSession({ type: "doctor", doctorid: doctor.id, name: doctor.name });
  return Response.json({ type: "doctor", name: doctor.name }, { status: 200 });
}
