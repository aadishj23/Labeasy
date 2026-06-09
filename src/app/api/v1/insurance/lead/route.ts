import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Log interest in a plan (a lead for the insurer). Works for guests too.
export async function POST(request: Request) {
  const { companyId, planId } = await request.json().catch(() => ({}));
  if (!companyId) return Response.json({ message: "companyId required." }, { status: 400 });

  const auth = await verifyAuth().catch(() => null);
  const userId = auth?.type === "user" ? (auth.userID as string) : null;

  try {
    // Avoid spamming: one CLICKED lead per (user, plan) is enough.
    if (userId && planId) {
      const recent = await prisma.insuranceLead.findFirst({
        where: { company_id: companyId, plan_id: planId, user_id: userId, status: "CLICKED" },
      });
      if (recent) return Response.json({ ok: true });
    }
    await prisma.insuranceLead.create({
      data: { company_id: companyId, plan_id: planId || null, user_id: userId, status: "CLICKED" },
    });
  } catch {
    /* best-effort: a bad companyId shouldn't surface an error */
  }
  return Response.json({ ok: true });
}
