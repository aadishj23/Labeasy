import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { labBalance, labPending } from "@/lib/wallet";

// The current lab's wallet: net balance, pending earnings, and entry history.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "lab") return unauthorized();

  const [balance, pending, entries] = await Promise.all([
    labBalance(auth.labID as string),
    labPending(auth.labID as string),
    prisma.walletEntry.findMany({
      where: { owner_type: "LAB", owner_id: auth.labID },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
  ]);

  return Response.json({ balance, pending, entries });
}
