import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";
import { forbidden } from "@/lib/api";

// Admin: list profile change requests (default PENDING) with current lab values.
export async function GET(request: Request) {
  if (!verifyAdmin(request)) return forbidden();

  const status = new URL(request.url).searchParams.get("status") || "PENDING";

  const requests = await prisma.profileChangeRequest.findMany({
    where: { status },
    orderBy: { created_at: "desc" },
    include: {
      lab: {
        select: {
          id: true,
          lab_name: true,
          owner_name: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          license_no: true,
          gst_no: true,
        },
      },
    },
  });

  return Response.json({ requests });
}
