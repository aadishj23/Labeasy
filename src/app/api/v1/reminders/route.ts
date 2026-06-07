import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// List the user's active reminders + tests they've booked (for the add form).
export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const userId = auth.userID as string;

  const [reminders, items] = await Promise.all([
    prisma.testReminder.findMany({
      where: { user_id: userId, active: true },
      orderBy: { due_at: "asc" },
    }),
    prisma.orderItem.findMany({
      where: { order: { user_id: userId } },
      select: { test_name: true },
      distinct: ["test_name"],
      take: 100,
    }),
  ]);

  const suggestedTests = [...new Set(items.map((i) => i.test_name))].sort();
  return Response.json({ reminders, suggestedTests });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const userId = auth.userID as string;

  const b = await request.json().catch(() => ({}));
  const test_name = (b.test_name || "").trim();
  const interval_days = Math.round(Number(b.interval_days));
  if (!test_name || !Number.isFinite(interval_days) || interval_days < 1) {
    return Response.json(
      { message: "A test and a valid interval are required." },
      { status: 400 }
    );
  }

  const due_at = new Date(Date.now() + interval_days * 24 * 60 * 60 * 1000);

  const reminder = await prisma.testReminder.create({
    data: { user_id: userId, test_name, interval_days, due_at },
  });
  return Response.json({ reminder });
}
