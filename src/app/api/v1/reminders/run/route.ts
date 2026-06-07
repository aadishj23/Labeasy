import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { notifyTestReminder } from "@/lib/email";

// Emails patients whose reminders are due. Run by a scheduler (x-cron-secret)
// or an admin. Notifies once per cycle (reset when a reminder is rescheduled).
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const headerSecret = request.headers.get("x-cron-secret");
  const allowed =
    (secret && headerSecret === secret) || verifyAdmin(request);
  if (!allowed) return forbidden();

  const due = await prisma.testReminder.findMany({
    where: { active: true, due_at: { lte: new Date() }, last_notified_at: null },
    include: { user: { select: { email: true } } },
    take: 200,
  });

  let sent = 0;
  for (const r of due) {
    await notifyTestReminder({
      patientEmail: r.user?.email,
      testName: r.test_name,
    });
    await prisma.testReminder.update({
      where: { id: r.id },
      data: { last_notified_at: new Date() },
    });
    sent++;
  }

  return Response.json({ ok: true, sent });
}
