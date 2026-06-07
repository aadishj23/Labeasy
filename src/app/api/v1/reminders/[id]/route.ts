import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

// Reschedule a reminder to its next cycle (e.g. after re-testing).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const { id } = await params;

  const reminder = await prisma.testReminder.findUnique({ where: { id } });
  if (!reminder || reminder.user_id !== auth.userID) {
    return Response.json({ message: "Reminder not found." }, { status: 404 });
  }

  const due_at = new Date(
    Date.now() + reminder.interval_days * 24 * 60 * 60 * 1000
  );
  const updated = await prisma.testReminder.update({
    where: { id },
    data: { due_at, last_notified_at: null, active: true },
  });
  return Response.json({ reminder: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();
  const { id } = await params;

  const reminder = await prisma.testReminder.findUnique({ where: { id } });
  if (!reminder || reminder.user_id !== auth.userID) {
    return Response.json({ message: "Reminder not found." }, { status: 404 });
  }
  await prisma.testReminder.delete({ where: { id } });
  return Response.json({ ok: true });
}
