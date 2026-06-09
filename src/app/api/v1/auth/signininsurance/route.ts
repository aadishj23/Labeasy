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

  const company = await prisma.insuranceCompany.findUnique({
    where: { email: String(email).toLowerCase() },
  });
  if (!company || !(await bcrypt.compare(password, company.password))) {
    return Response.json({ message: "Invalid email or password." }, { status: 401 });
  }

  await createSession({
    type: "insurance",
    insuranceid: company.id,
    name: company.name,
  });
  return Response.json({ type: "insurance", name: company.name }, { status: 200 });
}
