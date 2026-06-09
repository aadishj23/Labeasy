import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { ownerBalance, postEntry } from "@/lib/wallet";

// Pay out a positive balance (we owe the vendor) or log a reminder for a
// negative balance (the vendor owes us).
export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const { ownerType, ownerId, action, reference } = await request.json().catch(() => ({}));
  if (!["LAB", "DOCTOR", "INSURANCE"].includes(ownerType) || !ownerId) {
    return Response.json({ message: "Invalid vendor." }, { status: 400 });
  }

  const balance = await ownerBalance(ownerType, ownerId);

  if (action === "payout") {
    if (balance <= 0) {
      return Response.json({ message: "Nothing to pay out." }, { status: 400 });
    }
    await postEntry({
      ownerType,
      ownerId,
      amount: -balance,
      type: "PAYOUT",
      description: reference ? `Payout · ${reference}` : "Payout settled",
      refId: `payout:${ownerType}:${ownerId}:${balance}`,
    });
    return Response.json({ ok: true, paidOut: balance });
  }

  if (action === "reminder") {
    // Hobby project: we simply acknowledge. (Hook up email/SMS later.)
    return Response.json({ ok: true, reminded: true, due: Math.abs(Math.min(0, balance)) });
  }

  return Response.json({ message: "Unknown action." }, { status: 400 });
}
