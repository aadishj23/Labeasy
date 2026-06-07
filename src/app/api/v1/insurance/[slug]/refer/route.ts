import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

// Logs a referral lead and 302-redirects to the insurer's affiliate URL with
// a tracking sub_id. Works whether or not the visitor is signed in.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const partner = await prisma.insurancePartner.findUnique({ where: { slug } });
  if (!partner || !partner.active) {
    return Response.redirect(new URL("/insurance", request.url).toString(), 302);
  }

  const auth = await verifyAuth().catch(() => null);
  const userId = auth?.type === "user" ? (auth.userID as string) : null;

  const subId = randomUUID();
  await prisma.insuranceLead.create({
    data: {
      partner_id: partner.id,
      user_id: userId,
      sub_id: subId,
      status: "CLICKED",
    },
  });

  // Append the sub_id to the affiliate URL for commission attribution.
  let target: URL;
  try {
    target = new URL(partner.referral_url);
  } catch {
    return Response.redirect(new URL("/insurance", request.url).toString(), 302);
  }
  target.searchParams.set("sub_id", subId);

  return Response.redirect(target.toString(), 302);
}
