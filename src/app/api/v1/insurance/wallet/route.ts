import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ownerBalance } from "@/lib/wallet";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "insurance") return unauthorized();
  const id = auth.insuranceID as string;
  const [balance, entries] = await Promise.all([
    ownerBalance("INSURANCE", id),
    prisma.walletEntry.findMany({
      where: { owner_type: "INSURANCE", owner_id: id },
      orderBy: { created_at: "desc" }, take: 100,
    }),
  ]);
  return Response.json({ balance, entries });
}
