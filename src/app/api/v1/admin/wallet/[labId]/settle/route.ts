import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { labBalance, postEntry } from "@/lib/wallet";

// Settle (pay out) money owed to a lab — debits the wallet by the paid amount.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ labId: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();

  const { labId } = await params;
  const { amount, reference } = await request.json().catch(() => ({}));

  const balance = await labBalance(labId);
  if (balance <= 0) {
    return Response.json(
      { message: "Nothing to settle — balance is not positive." },
      { status: 400 }
    );
  }

  // Default to the full positive balance; never settle more than is owed.
  const requested = amount ? Math.round(Number(amount) * 100) : balance;
  const settle = Math.min(Math.max(0, requested), balance);
  if (settle <= 0) {
    return Response.json({ message: "Invalid settle amount." }, { status: 400 });
  }

  await postEntry({
    ownerType: "LAB",
    ownerId: labId,
    amount: -settle,
    type: "PAYOUT",
    description: reference ? `Settlement · ${reference}` : "Settlement",
  });

  return Response.json({ ok: true, settled: settle });
}
