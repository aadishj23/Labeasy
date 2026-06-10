import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ownerBalance } from "@/lib/wallet";

// The doctor's wallet: balance, pending earnings, and entry history.
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const doctorId = auth.doctorID as string;

  const [balance, pendingAgg, entries] = await Promise.all([
    ownerBalance("DOCTOR", doctorId),
    prisma.appointment.aggregate({
      where: { doctor_id: doctorId, status: "CONFIRMED", source: "PLATFORM" },
      _sum: { fee: true, platform_discount: true },
    }),
    prisma.walletEntry.findMany({
      where: { owner_type: "DOCTOR", owner_id: doctorId },
      orderBy: { created_at: "desc" },
      take: 100,
    }),
  ]);

  return Response.json({
    balance,
    pending: (pendingAgg._sum.fee || 0) + (pendingAgg._sum.platform_discount || 0),
    entries,
  });
}
