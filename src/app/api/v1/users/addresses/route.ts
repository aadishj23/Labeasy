import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

function validate(body: any) {
  const required = ["line1", "city", "state", "pincode"];
  for (const f of required) {
    if (!body[f] || !String(body[f]).trim()) return `${f} is required.`;
  }
  if (!/^\d{6}$/.test(String(body.pincode))) return "Pincode must be 6 digits.";
  return null;
}

// Create a saved address (optionally the default).
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const body = await request.json().catch(() => ({}));
  const err = validate(body);
  if (err) return Response.json({ message: err }, { status: 400 });

  const makeDefault =
    body.is_default === true ||
    (await prisma.address.count({ where: { user_id: auth.userID } })) === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({
        where: { user_id: auth.userID },
        data: { is_default: false },
      });
    }
    return tx.address.create({
      data: {
        user_id: auth.userID as string,
        label: body.label || null,
        line1: String(body.line1).trim(),
        line2: body.line2 || null,
        city: String(body.city).trim(),
        state: String(body.state).trim(),
        pincode: String(body.pincode).trim(),
        is_default: makeDefault,
      },
    });
  });

  return Response.json({ address });
}
