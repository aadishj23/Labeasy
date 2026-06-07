import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden, prismaErrorResponse } from "@/lib/api";
import { slugify } from "@/lib/slug";

// Admin: approve or reject a lab profile change request.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdmin(request);
  if (!admin) return forbidden();

  const { id } = await params;
  const { action } = await request.json().catch(() => ({}));

  if (!["approve", "reject"].includes(action)) {
    return Response.json({ message: "Invalid action." }, { status: 400 });
  }

  const req = await prisma.profileChangeRequest.findUnique({ where: { id } });
  if (!req || req.status !== "PENDING") {
    return Response.json(
      { message: "Request not found or already handled." },
      { status: 404 }
    );
  }

  try {
    if (action === "reject") {
      await prisma.profileChangeRequest.update({
        where: { id },
        data: { status: "REJECTED", reviewed_by: admin.email },
      });
      return Response.json({ ok: true, status: "REJECTED" });
    }

    // approve → apply changes to the lab
    const changes = (req.changes || {}) as Record<string, string>;
    const data: Record<string, unknown> = { ...changes };
    if (changes.lab_name) {
      data.slug = `${slugify(changes.lab_name)}-${req.lab_id.slice(-4).toLowerCase()}`;
    }

    await prisma.$transaction([
      prisma.lab.update({ where: { id: req.lab_id }, data }),
      prisma.profileChangeRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewed_by: admin.email },
      }),
    ]);

    return Response.json({ ok: true, status: "APPROVED" });
  } catch (e) {
    const friendly = prismaErrorResponse(e);
    if (friendly) return friendly;
    return Response.json({ message: "Could not apply changes." }, { status: 500 });
  }
}
