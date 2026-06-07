import prisma from "@/lib/prisma";
import { createOtp, getResendWaitMs } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

// Sends a reset code to the configured ADMIN_EMAIL. Takes no input so the admin
// address is never exposed by the request.
export async function POST() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail) {
    return Response.json({ message: "Admin is not configured." }, { status: 400 });
  }
  const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    return Response.json({ message: "Admin is not configured." }, { status: 400 });
  }

  const waitMs = await getResendWaitMs(adminEmail, "admin_reset");
  if (waitMs > 0) {
    return Response.json(
      { message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.` },
      { status: 429 }
    );
  }

  try {
    const code = await createOtp(adminEmail, "admin_reset");
    await sendOtpEmail(adminEmail, code, "reset");
    return Response.json({ message: "A reset code was sent to the admin email." });
  } catch (error) {
    console.error("Error in /admin/forgot-password route:", error);
    return Response.json(
      { message: "Could not send the reset code. Please try again." },
      { status: 500 }
    );
  }
}
