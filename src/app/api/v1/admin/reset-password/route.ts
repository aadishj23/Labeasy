import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { isStrongPassword, PASSWORD_RULE } from "@/lib/password";

export async function POST(request: Request) {
  const { otp, newPassword } = await request.json().catch(() => ({}));
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  if (!adminEmail) {
    return Response.json({ message: "Admin is not configured." }, { status: 400 });
  }
  if (!otp) {
    return Response.json(
      { message: "A verification code is required." },
      { status: 400 }
    );
  }
  if (!isStrongPassword(newPassword)) {
    return Response.json({ message: PASSWORD_RULE }, { status: 400 });
  }

  const valid = await verifyOtp(adminEmail, "admin_reset", otp);
  if (!valid) {
    return Response.json(
      { message: "Invalid or expired verification code." },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.admin.update({
    where: { email: adminEmail },
    data: { password: hashedPassword },
  });

  return Response.json({ message: "Password reset successfully." });
}
