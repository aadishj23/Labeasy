import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { verifyAuth, unauthorized } from "@/lib/auth";

async function ownReport(userId: string, id: string) {
  const report = await prisma.report.findUnique({ where: { id } });
  return report && report.user_id === userId ? report : null;
}

// Enable sharing — returns a stable public token (idempotent).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { id } = await params;
  const report = await ownReport(auth.userID as string, id);
  if (!report) {
    return Response.json({ message: "Report not found." }, { status: 404 });
  }

  let token = report.share_token;
  if (!token) {
    token = nanoid(24);
    await prisma.report.update({ where: { id }, data: { share_token: token } });
  }

  return Response.json({ token });
}

// Revoke sharing.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth || auth.type !== "user") return unauthorized();

  const { id } = await params;
  const report = await ownReport(auth.userID as string, id);
  if (!report) {
    return Response.json({ message: "Report not found." }, { status: 404 });
  }

  await prisma.report.update({ where: { id }, data: { share_token: null } });
  return Response.json({ ok: true });
}
