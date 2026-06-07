import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

const STATUSES = ["PENDING", "PAID", "WAIVED"];

// Mark an invoice paid / waived / pending.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();

  const { id } = await params;
  const { status } = await request.json().catch(() => ({}));
  if (!STATUSES.includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }

  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status, paid_at: status === "PAID" ? new Date() : null },
    });
    return Response.json({ invoice });
  } catch {
    return Response.json({ message: "Invoice not found." }, { status: 404 });
  }
}
