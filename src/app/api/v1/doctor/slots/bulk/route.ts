import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

const MAX_SLOTS = 500;

// Bulk-create slots. The client computes the concrete start times (in the
// doctor's timezone) from a recurring rule, so this just persists them.
export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "doctor") return unauthorized();

  const b = await request.json().catch(() => ({}));
  const starts: string[] = Array.isArray(b.starts) ? b.starts : [];
  const durationMin = Math.max(10, Math.min(240, Math.round(Number(b.durationMin) || 30)));
  const capacity = Math.max(1, Math.round(Number(b.capacity) || 1));

  if (starts.length === 0) {
    return Response.json({ message: "No slots to create." }, { status: 400 });
  }
  if (starts.length > MAX_SLOTS) {
    return Response.json(
      { message: `That's too many slots at once (max ${MAX_SLOTS}). Narrow the range.` },
      { status: 400 }
    );
  }

  const now = Date.now();
  const wanted = starts
    .map((s) => new Date(s))
    .filter((d) => !isNaN(d.getTime()) && d.getTime() > now);

  // Skip slots that already exist for this doctor at the same start time.
  const existing = await prisma.doctorSlot.findMany({
    where: { doctor_id: auth.doctorID, start_at: { in: wanted } },
    select: { start_at: true },
  });
  const taken = new Set(existing.map((e) => e.start_at.getTime()));

  const data = wanted
    .filter((d) => !taken.has(d.getTime()))
    .map((d) => ({
      doctor_id: auth.doctorID as string,
      start_at: d,
      end_at: new Date(d.getTime() + durationMin * 60 * 1000),
      capacity,
    }));

  if (data.length === 0) {
    return Response.json({ created: 0, message: "All those slots already exist." });
  }

  await prisma.doctorSlot.createMany({ data });
  return Response.json({ created: data.length });
}
