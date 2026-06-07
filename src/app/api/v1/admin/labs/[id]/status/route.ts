import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden, prismaErrorResponse } from "@/lib/api";

const STATUSES = ["PENDING", "VERIFIED", "SUSPENDED"];

// Admin: approve / reject / suspend a lab, and optionally set accreditations.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdmin(request)) return forbidden();

  const { id } = await params;
  const { status, accreditations } = await request.json().catch(() => ({}));

  if (!STATUSES.includes(status)) {
    return Response.json({ message: "Invalid status." }, { status: 400 });
  }

  const data: {
    status: "PENDING" | "VERIFIED" | "SUSPENDED";
    accreditations?: string[];
  } = { status };

  if (Array.isArray(accreditations)) {
    data.accreditations = accreditations
      .map((a: unknown) => String(a).trim())
      .filter(Boolean);
  }

  try {
    const lab = await prisma.lab.update({
      where: { id },
      data,
      select: { id: true, status: true, accreditations: true },
    });
    return Response.json({ lab });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Update failed." }, { status: 500 });
  }
}
