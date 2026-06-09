import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const plans = await prisma.insurancePlan.findMany({
    where: { company_id: auth.insuranceID as string },
    orderBy: { created_at: "desc" },
  });
  return Response.json({ plans });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();

  const b = await request.json().catch(() => ({}));
  const name = (b.name || "").trim();
  const description = (b.description || "").trim();
  const priceR = Number(b.price);
  const commission_pct = Math.max(0, Math.min(100, Math.round(Number(b.commission_pct) || 0)));

  if (!name || !description || !Number.isFinite(priceR) || priceR <= 0) {
    return Response.json(
      { message: "Name, description and a valid price are required." },
      { status: 400 }
    );
  }

  const plan = await prisma.insurancePlan.create({
    data: {
      company_id: auth.insuranceID as string,
      name,
      description,
      price: Math.round(priceR * 100),
      commission_pct,
      commission_approved: false, // admin approves before it's sellable
    },
  });
  return Response.json({ plan });
}
