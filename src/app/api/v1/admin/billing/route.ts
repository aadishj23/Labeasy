import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";
import { generateInvoices, isValidPeriod } from "@/lib/billing";

// List invoices (optionally for a period) with lab names.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const period = new URL(request.url).searchParams.get("period");
  const invoices = await prisma.invoice.findMany({
    where: period && isValidPeriod(period) ? { period } : {},
    orderBy: [{ period: "desc" }, { fee: "desc" }],
    include: { lab: { select: { lab_name: true } } },
  });
  return Response.json({ invoices });
}

// Run billing for a month — generates/updates invoices for all labs with GMV.
export async function POST(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const { period } = await request.json().catch(() => ({}));
  if (!period || !isValidPeriod(period)) {
    return Response.json(
      { message: "A valid period (YYYY-MM) is required." },
      { status: 400 }
    );
  }

  const invoices = await generateInvoices(period);
  return Response.json({ ok: true, count: invoices.length });
}
