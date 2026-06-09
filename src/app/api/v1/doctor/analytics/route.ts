import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";
import { ownerBalance } from "@/lib/wallet";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();
  const id = auth.doctorID as string;

  const [appts, balance] = await Promise.all([
    prisma.appointment.findMany({
      where: { doctor_id: id, status: { not: "PLACED" } },
      select: { status: true, fee: true, source: true, scheduled_at: true },
    }),
    ownerBalance("DOCTOR", id),
  ]);

  const now = new Date();
  const platform = appts.filter((a) => a.source === "PLATFORM");
  const manual = appts.filter((a) => a.source === "MANUAL" && a.status !== "CANCELLED");

  const completed = platform.filter((a) => a.status === "COMPLETED");
  const revenue = completed.reduce((s, a) => s + a.fee, 0);

  // Off-platform (manual) consults the doctor logged themselves.
  const offPlatformGmv = manual.reduce((s, a) => s + a.fee, 0);

  const monthly: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const v = completed
      .filter((a) => {
        const d = new Date(a.scheduled_at);
        return d >= from && d < to;
      })
      .reduce((s, a) => s + a.fee, 0);
    monthly.push({ label: from.toLocaleString("en-US", { month: "short" }), value: Math.round(v / 100) });
  }

  return Response.json({
    summary: {
      appointments: platform.length,
      completed: completed.length,
      cancelled: platform.filter((a) => a.status === "CANCELLED").length,
      upcoming: platform.filter((a) => a.status === "CONFIRMED" && new Date(a.scheduled_at) >= now).length,
      revenue: Math.round(revenue / 100),
      balance: Math.round(balance / 100),
      offPlatformConsults: manual.length,
      offPlatformGmv: Math.round(offPlatformGmv / 100),
    },
    monthly,
  });
}
