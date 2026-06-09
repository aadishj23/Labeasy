import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { runPlatformFees } from "@/lib/billing";

// Scheduled (cron) endpoint — charges the previous month's GMV-slab platform
// fee to every lab & doctor. Run by a scheduler (x-cron-secret header) or an
// admin. Idempotent per vendor+month, so re-running is safe.
async function run(request: Request) {
  const secret = process.env.CRON_SECRET;
  const headerSecret = request.headers.get("x-cron-secret");
  const allowed = (secret && headerSecret === secret) || verifyAdmin(request);
  if (!allowed) return forbidden();

  // Previous calendar month (run on the 1st → bills the month just ended).
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const charged = await runPlatformFees(period);
  return Response.json({ ok: true, period, charged });
}

export async function POST(request: Request) {
  return run(request);
}
export async function GET(request: Request) {
  return run(request);
}
