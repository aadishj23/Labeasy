import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const company = await prisma.insuranceCompany.findUnique({
    where: { id: auth.insuranceID },
    select: {
      id: true, name: true, email: true, description: true,
      status: true, active: true,
      _count: { select: { plans: true, leads: true } },
    },
  });
  if (!company) return Response.json({ message: "Not found." }, { status: 404 });
  return Response.json({ company });
}
