import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// The current lab's platform-fee invoices (billing history).
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const invoices = await prisma.invoice.findMany({
    where: { lab_id: auth.labID },
    orderBy: { period: "desc" },
  });
  return Response.json({ invoices });
}
